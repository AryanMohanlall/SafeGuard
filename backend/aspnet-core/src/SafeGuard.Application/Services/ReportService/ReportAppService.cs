using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.UI;
using SafeGuard.Domains.Reports;
using SafeGuard.Services.ReportService.Dto;

namespace SafeGuard.Services.ReportService;

[AbpAuthorize]
public class ReportAppService
    : AsyncCrudAppService<Report, ReportDto, Guid, PagedReportResultRequestDto, CreateReportDto, UpdateReportDto>,
      IReportAppService
{
    public ReportAppService(IRepository<Report, Guid> repository)
        : base(repository)
    {
    }

    protected override IQueryable<Report> CreateFilteredQuery(PagedReportResultRequestDto input)
    {
        return Repository.GetAll()
            .WhereIf(
                !input.Keyword.IsNullOrWhiteSpace(),
                r => r.Title.Contains(input.Keyword) || r.Location.Contains(input.Keyword)
            );
    }

    public async Task<ReportAudioDto> GetAudioAsync(Guid id)
    {
        var report = await Repository.GetAsync(id);

        if (report.AudioFile == null || report.AudioFile.Length == 0)
        {
            throw new UserFriendlyException("This report does not have an audio attachment.");
        }

        return new ReportAudioDto
        {
            Id = report.Id,
            AudioFile = report.AudioFile,
            AudioFileName = report.AudioFileName,
            AudioContentType = report.AudioContentType
        };
    }

    protected override ReportDto MapToEntityDto(Report entity)
    {
        var dto = base.MapToEntityDto(entity);
        dto.HasAudio = entity.AudioFile != null && entity.AudioFile.Length > 0;
        return dto;
    }
}
