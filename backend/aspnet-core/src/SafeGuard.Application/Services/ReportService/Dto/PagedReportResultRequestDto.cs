using Abp.Application.Services.Dto;

namespace SafeGuard.Services.ReportService.Dto;

public class PagedReportResultRequestDto : PagedResultRequestDto
{
    public string Keyword { get; set; }
}
