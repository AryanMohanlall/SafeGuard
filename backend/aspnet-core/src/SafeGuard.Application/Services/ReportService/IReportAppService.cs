using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using SafeGuard.Services.ReportService.Dto;


namespace SafeGuard.Services.ReportService;

public interface IReportAppService
    : IAsyncCrudAppService<ReportDto, Guid, PagedReportResultRequestDto, CreateReportDto, UpdateReportDto>
{
    Task<ReportAudioDto> GetAudioAsync(Guid id);
}
