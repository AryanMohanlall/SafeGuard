using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;

namespace SafeGuard.Domains.Blockchain;

/// <summary>
/// A single immutable record in the simulated blockchain ledger.
/// Each entry is cryptographically linked to the one before it.
/// </summary>
public class LedgerEntry : Entity<Guid>
{
    // What was recorded
    [Required][MaxLength(50)]
    public string EntityType { get; set; }      // Evidence | Case | Custody

    [Required][MaxLength(200)]
    public string EntityId { get; set; }         // SafeGuard GUID

    [Required][MaxLength(100)]
    public string Action { get; set; }           // RegisterEvidence | LogCustody | LogCaseStatus

    // Serialised snapshot of the record at this moment
    [Required]
    public string Payload { get; set; }

    // Chain integrity
    [Required][MaxLength(64)]
    public string DataHash { get; set; }         // SHA-256(Payload + PreviousHash)

    [MaxLength(64)]
    public string PreviousHash { get; set; }     // ChainHash of the previous entry; null for genesis

    [Required][MaxLength(64)]
    public string ChainHash { get; set; }        // SHA-256(DataHash + PreviousHash) — the "block hash"

    // Who and when
    public long? ActorUserId { get; set; }

    public DateTime RecordedAt { get; set; }

    // Tamper-evidence: HMAC-SHA256 of ChainHash, signed with the server secret
    [Required][MaxLength(64)]
    public string ServerSignature { get; set; }
}
