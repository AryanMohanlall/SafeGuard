using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace SafeGuard.Services.CaseService.Dto;

[AutoMap(typeof(Domains.Case.Case))]
public class CaseDto : EntityDto<Guid>
{
    public string CaseNumber { get; set; }
    public string Title { get; set; }
    public string Summary { get; set; }
    public string Status { get; set; }
    public string Severity { get; set; }
    public string Category { get; set; }
    public List<Guid> IncidentIds { get; set; } = new();
    public int IncidentCount { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public bool IsCourtReady { get; set; }
    public DateTime? CourtReadyAt { get; set; }
    public string ClosureReason { get; set; }
    public string AiSummary { get; set; }
    public DateTime CreationTime { get; set; }
    public long? CreatorUserId { get; set; }
}
