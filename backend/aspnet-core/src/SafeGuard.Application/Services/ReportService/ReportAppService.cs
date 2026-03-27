using System;
using System.Linq;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
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
}
