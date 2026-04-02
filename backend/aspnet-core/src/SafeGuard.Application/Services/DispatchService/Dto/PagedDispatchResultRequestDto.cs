using System;
using Abp.Application.Services.Dto;

namespace SafeGuard.Services.DispatchService.Dto;

public class PagedDispatchResultRequestDto : PagedResultRequestDto
{
    public string Keyword { get; set; }
    public Guid? IncidentId { get; set; }
    public Guid? CaseId { get; set; }
    public string Status { get; set; }
    public bool ActiveOnly { get; set; }
}
