using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace SafeGuard.Services.EvidenceService.Dto;

[AutoMap(typeof(Domains.Evidence.Evidence))]
public class EvidenceDto : EntityDto<Guid>
{
    public Guid CaseId { get; set; }
    public Guid? IncidentId { get; set; }
    public string Type { get; set; }
    public string Status { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public long FileSizeBytes { get; set; }
    public string StorageUrl { get; set; }
    public string FileHash { get; set; }
    public string IpfsCid { get; set; }
    public string BlockchainTx { get; set; }
    public string DetectedObjects { get; set; }
    public string AiCaption { get; set; }
    public string AiSuggestedSeverity { get; set; }
    public decimal? ManipulationScore { get; set; }
    public bool? IsFlagged { get; set; }
    public string ManipulationStatus { get; set; }
    public DateTime CollectedAt { get; set; }
    public DateTime UploadedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string Notes { get; set; }
    public DateTime CreationTime { get; set; }
    public long? CreatorUserId { get; set; }
}
