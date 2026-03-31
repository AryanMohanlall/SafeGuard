using Abp.Application.Services.Dto;

namespace SafeGuard.Services.CaseService.Dto;

public class PagedCaseResultRequestDto : PagedResultRequestDto
{
    public string Keyword { get; set; }
    public string Status { get; set; }
    public string Severity { get; set; }
}
