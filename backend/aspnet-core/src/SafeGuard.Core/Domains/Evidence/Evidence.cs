using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;

namespace SafeGuard.Domains.Evidence;

public class Evidence : FullAuditedEntity<Guid>
{
    [Required]
    public Guid CaseId { get; set; }

    public Guid? IncidentId { get; set; }

    [ForeignKey(nameof(IncidentId))]
    public Incidents.Incident Incident { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; }               // Photo | Video | Audio | Document | Physical | Other

    [Required]
    [MaxLength(50)]
    public string Status { get; set; }             // Uploaded | Pending | Verified | Admitted | Flagged

    // File metadata (no binary blobs — store in Azure Blob Storage)
    [Required]
    [MaxLength(500)]
    public string FileName { get; set; }

    [MaxLength(100)]
    public string ContentType { get; set; }        // MIME type e.g. image/jpeg

    public long FileSizeBytes { get; set; }

    [MaxLength(1000)]
    public string StorageUrl { get; set; }         // Azure Blob Storage URL

    // Integrity
    [MaxLength(64)]
    public string FileHash { get; set; }           // SHA-256 hex string

    [MaxLength(200)]
    public string IpfsCid { get; set; }            // IPFS content ID if pinned

    [MaxLength(200)]
    public string BlockchainTx { get; set; }       // on-chain transaction reference

    // Computer Vision results (from Azure CV)
    [MaxLength(4000)]
    public string DetectedObjects { get; set; }    // JSON array from CV

    [MaxLength(2000)]
    public string AiCaption { get; set; }          // natural language description from CV

    [MaxLength(50)]
    public string AiSuggestedSeverity { get; set; } // severity suggested by CV tags

    // Deepfake analysis
    public decimal? ManipulationScore { get; set; } // 0.00–100.00
    public bool? IsFlagged { get; set; }

    [MaxLength(50)]
    public string ManipulationStatus { get; set; } // Authentic | Suspicious | Flagged

    // Dates
    public DateTime CollectedAt { get; set; }      // when evidence was physically collected
    public DateTime UploadedAt { get; set; }       // when uploaded to the system
    public DateTime? VerifiedAt { get; set; }      // when an officer verified it

    [MaxLength(1000)]
    public string Notes { get; set; }              // free text notes from the uploading officer

    // Navigation
    public ICollection<ChainOfCustody> CustodyLog { get; set; }
}

public class ChainOfCustody : FullAuditedEntity<Guid>
{
    [Required]
    public Guid EvidenceId { get; set; }

    [ForeignKey(nameof(EvidenceId))]
    public Evidence Evidence { get; set; }

    [Required]
    [MaxLength(200)]
    public string Action { get; set; }             // e.g. "Collected", "Transferred", "Examined"

    [MaxLength(200)]
    public string HandledBy { get; set; }

    public DateTime HandledAt { get; set; }

    [MaxLength(500)]
    public string Notes { get; set; }
}
