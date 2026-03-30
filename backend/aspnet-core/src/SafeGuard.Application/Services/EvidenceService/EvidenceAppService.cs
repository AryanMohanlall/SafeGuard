using System;
using System.Linq;
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using SafeGuard.Services.EvidenceService.Dto;

namespace SafeGuard.Services.EvidenceService;

[AbpAuthorize]
public class EvidenceAppService
    : AsyncCrudAppService<Domains.Evidence.Evidence, EvidenceDto, Guid, PagedEvidenceResultRequestDto, CreateEvidenceDto, UpdateEvidenceDto>,
      IEvidenceAppService
{
    public EvidenceAppService(IRepository<Domains.Evidence.Evidence, Guid> repository)
        : base(repository)
    {
    }

    protected override IQueryable<Domains.Evidence.Evidence> CreateFilteredQuery(PagedEvidenceResultRequestDto input)
    {
        return Repository.GetAll()
            .WhereIf(
                !input.Keyword.IsNullOrWhiteSpace(),
                e => e.FileName.Contains(input.Keyword) ||
                     e.Type.Contains(input.Keyword) ||
                     e.Notes.Contains(input.Keyword))
            .WhereIf(
                !input.Status.IsNullOrWhiteSpace(),
                e => e.Status == input.Status)
            .WhereIf(
                input.CaseId.HasValue,
                e => e.CaseId == input.CaseId.Value);
    }
}
