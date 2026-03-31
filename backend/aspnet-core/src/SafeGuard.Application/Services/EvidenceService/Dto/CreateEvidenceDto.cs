using System;
using System.ComponentModel.DataAnnotations;
using Abp.AutoMapper;

namespace SafeGuard.Services.EvidenceService.Dto;

[AutoMap(typeof(Domains.Evidence.Evidence))]
public class CreateEvidenceDto
{
    [Required]
    public Guid CaseId { get; set; }

    public Guid? IncidentId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; }

    [Required]
    [MaxLength(500)]
    public string FileName { get; set; }

    [MaxLength(100)]
    public string ContentType { get; set; }

    public long FileSizeBytes { get; set; }

    [MaxLength(1000)]
    public string StorageUrl { get; set; }

    [MaxLength(64)]
    public string FileHash { get; set; }

    [MaxLength(200)]
    public string IpfsCid { get; set; }

    [MaxLength(200)]
    public string BlockchainTx { get; set; }

    [MaxLength(4000)]
    public string DetectedObjects { get; set; }

    [MaxLength(2000)]
    public string AiCaption { get; set; }

    [MaxLength(50)]
    public string AiSuggestedSeverity { get; set; }

    public decimal? ManipulationScore { get; set; }
    public bool? IsFlagged { get; set; }

    [MaxLength(50)]
    public string ManipulationStatus { get; set; }

    [Required]
    public DateTime CollectedAt { get; set; }

    [Required]
    public DateTime UploadedAt { get; set; }

    public DateTime? VerifiedAt { get; set; }

    [MaxLength(1000)]
    public string Notes { get; set; }
}
