using System;
using Abp.Application.Services.Dto;

namespace SafeGuard.Services.EvidenceService.Dto;

public class PagedEvidenceResultRequestDto : PagedResultRequestDto
{
    public string Keyword { get; set; }
    public string Status { get; set; }
    public Guid? CaseId { get; set; }
}
