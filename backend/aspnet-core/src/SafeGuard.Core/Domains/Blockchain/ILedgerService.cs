using System.Threading;
using System.Threading.Tasks;

namespace SafeGuard.Domains.Blockchain;

public interface ILedgerService
{
    /// <summary>
    /// Appends a new entry to the ledger, computing and linking all hashes.
    /// </summary>
    /// <param name="entityType">Evidence | Case | Custody</param>
    /// <param name="entityId">The GUID of the entity being recorded.</param>
    /// <param name="action">Human-readable action name, e.g. "RegisterEvidence".</param>
    /// <param name="payload">JSON snapshot of the entity at this moment.</param>
    /// <param name="actorUserId">ABP user ID of the actor (null for system actions).</param>
    Task<LedgerEntry> AppendAsync(
        string entityType,
        string entityId,
        string action,
        string payload,
        long? actorUserId = null);

    /// <summary>
    /// Walks every entry in chronological order and re-derives all hashes and signatures.
    /// Returns true if the entire chain is intact; false if any entry has been tampered with.
    /// </summary>
    Task<ChainVerificationResult> VerifyChainAsync(CancellationToken ct = default);
}

public sealed class ChainVerificationResult
{
    public bool IsValid { get; init; }

    /// <summary>Number of entries that were checked.</summary>
    public int TotalEntries { get; init; }

    /// <summary>Index (0-based) of the first broken link, or -1 when the chain is valid.</summary>
    public int FirstTamperedIndex { get; init; } = -1;

    /// <summary>Human-readable description of the failure, or null when valid.</summary>
    public string FailureReason { get; init; }
}
