using System;
using Abp.Application.Services.Dto;

namespace SafeGuard.Services.IncidentService.Dto;

public class PagedIncidentResultRequestDto : PagedResultRequestDto
{
    public string Keyword { get; set; }
    public Guid? CaseId { get; set; }
}
