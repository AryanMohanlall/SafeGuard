using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace SafeGuard.Domains.Blockchain;

/// <summary>
/// Simulated blockchain ledger service.
///
/// Each append:
///   DataHash      = SHA-256(Payload + PreviousHash)
///   ChainHash     = SHA-256(DataHash + PreviousHash)   ← the "block hash"
///   ServerSignature = HMAC-SHA-256(ChainHash, HmacSecret)
///
/// Configure the HMAC secret in appsettings.json:
///   "Blockchain": { "HmacSecret": "your-secret-here" }
/// </summary>
public class LedgerService : DomainService, ILedgerService
{
    // Prevents concurrent appends from racing on the "last entry" read.
    private static readonly SemaphoreSlim _appendLock = new(1, 1);

    private readonly IRepository<LedgerEntry, Guid> _ledgerRepo;
    private readonly byte[] _hmacKey;

    public LedgerService(
        IRepository<LedgerEntry, Guid> ledgerRepo,
        IConfiguration configuration)
    {
        _ledgerRepo = ledgerRepo;

        string secret = configuration["Blockchain:HmacSecret"];
        if (string.IsNullOrWhiteSpace(secret))
            throw new InvalidOperationException(
                "Blockchain:HmacSecret is not configured. " +
                "Add it to appsettings.json under \"Blockchain\": { \"HmacSecret\": \"...\" }.");

        _hmacKey = Encoding.UTF8.GetBytes(secret);
    }

    // -------------------------------------------------------------------------
    // Append
    // -------------------------------------------------------------------------

    public async Task<LedgerEntry> AppendAsync(
        string entityType,
        string entityId,
        string action,
        string payload,
        long? actorUserId = null)
    {
        await _appendLock.WaitAsync();
        try
        {
            // Fetch the most recent chain hash to link this new block.
            string previousHash = await _ledgerRepo
                .GetAll()
                .OrderByDescending(e => e.RecordedAt)
                .Select(e => e.ChainHash)
                .FirstOrDefaultAsync();

            string prev = previousHash ?? string.Empty;

            string dataHash  = ComputeSha256(payload + prev);
            string chainHash = ComputeSha256(dataHash  + prev);
            string signature = ComputeHmac(chainHash);

            var entry = new LedgerEntry
            {
                Id             = Guid.NewGuid(),
                EntityType     = entityType,
                EntityId       = entityId,
                Action         = action,
                Payload        = payload,
                DataHash       = dataHash,
                PreviousHash   = previousHash,   // null for the genesis entry
                ChainHash      = chainHash,
                ActorUserId    = actorUserId,
                RecordedAt     = DateTime.UtcNow,
                ServerSignature = signature
            };

            return await _ledgerRepo.InsertAsync(entry);
        }
        finally
        {
            _appendLock.Release();
        }
    }

    // -------------------------------------------------------------------------
    // Verify
    // -------------------------------------------------------------------------

    public async Task<ChainVerificationResult> VerifyChainAsync(CancellationToken ct = default)
    {
        var entries = await _ledgerRepo
            .GetAll()
            .OrderBy(e => e.RecordedAt)
            .ToListAsync(ct);

        if (entries.Count == 0)
            return new ChainVerificationResult { IsValid = true, TotalEntries = 0 };

        string runningPrev = string.Empty;

        for (int i = 0; i < entries.Count; i++)
        {
            var e = entries[i];

            // The first entry must have no previous hash.
            string expectedPrev = i == 0 ? null : entries[i - 1].ChainHash;
            if (e.PreviousHash != expectedPrev)
                return Broken(i, entries.Count,
                    $"Entry {i}: PreviousHash mismatch (expected '{expectedPrev}', got '{e.PreviousHash}').");

            string prev = e.PreviousHash ?? string.Empty;

            string expectedDataHash  = ComputeSha256(e.Payload + prev);
            string expectedChainHash = ComputeSha256(expectedDataHash + prev);
            string expectedSignature = ComputeHmac(expectedChainHash);

            if (e.DataHash != expectedDataHash)
                return Broken(i, entries.Count,
                    $"Entry {i}: DataHash mismatch — payload may have been altered.");

            if (e.ChainHash != expectedChainHash)
                return Broken(i, entries.Count,
                    $"Entry {i}: ChainHash mismatch — chain link broken.");

            if (e.ServerSignature != expectedSignature)
                return Broken(i, entries.Count,
                    $"Entry {i}: ServerSignature invalid — possible tampering or key rotation.");

            runningPrev = e.ChainHash;
        }

        return new ChainVerificationResult { IsValid = true, TotalEntries = entries.Count };
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static string ComputeSha256(string input)
    {
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private string ComputeHmac(string input)
    {
        byte[] bytes = HMACSHA256.HashData(_hmacKey, Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static ChainVerificationResult Broken(int index, int total, string reason) =>
        new()
        {
            IsValid              = false,
            TotalEntries         = total,
            FirstTamperedIndex   = index,
            FailureReason        = reason
        };
}
