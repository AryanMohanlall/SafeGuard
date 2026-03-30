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
using Microsoft.EntityFrameworkCore;
using SafeGuard.Domains.Case;
using SafeGuard.Services.CaseService.Dto;

namespace SafeGuard.Services.CaseService;

[AbpAuthorize]
public class CaseAppService
    : AsyncCrudAppService<Domains.Case.Case, CaseDto, Guid, PagedCaseResultRequestDto, CreateCaseDto, UpdateCaseDto>,
      ICaseAppService
{
    private readonly IRepository<CaseStatusHistory, Guid> _historyRepository;

    public CaseAppService(
        IRepository<Domains.Case.Case, Guid> repository,
        IRepository<CaseStatusHistory, Guid> historyRepository)
        : base(repository)
    {
        _historyRepository = historyRepository;
    }

    public override async Task<CaseDto> CreateAsync(CreateCaseDto input)
    {
        // Auto-generate CaseNumber before mapping
        var caseEntity = ObjectMapper.Map<Domains.Case.Case>(input);
        caseEntity.CaseNumber = await GenerateCaseNumberAsync();
        caseEntity.LastActivityAt = DateTime.UtcNow;

        await Repository.InsertAsync(caseEntity);
        await CurrentUnitOfWork.SaveChangesAsync();

        return ObjectMapper.Map<CaseDto>(caseEntity);
    }

    public override async Task<CaseDto> UpdateAsync(UpdateCaseDto input)
    {
        var caseEntity = await Repository.GetAsync(input.Id);
        var previousStatus = caseEntity.Status;

        ObjectMapper.Map(input, caseEntity);
        caseEntity.LastActivityAt = DateTime.UtcNow;

        // Record status transition if it changed
        if (previousStatus != input.Status)
        {
            await _historyRepository.InsertAsync(new CaseStatusHistory
            {
                CaseId = caseEntity.Id,
                FromStatus = previousStatus,
                ToStatus = input.Status,
                ChangedAt = DateTime.UtcNow,
            });

            if (input.Status == "Closed" || input.Status == "Void")
                caseEntity.ClosedAt = DateTime.UtcNow;

            if (input.Status == "PendingTrial")
            {
                caseEntity.IsCourtReady = true;
                caseEntity.CourtReadyAt = DateTime.UtcNow;
            }
        }

        await Repository.UpdateAsync(caseEntity);
        return ObjectMapper.Map<CaseDto>(caseEntity);
    }

    public async Task<CaseDto> TransitionStatusAsync(TransitionStatusInput input)
    {
        var allowedStatuses = new[] { "Draft", "Open", "UnderReview", "PendingTrial", "Closed", "Void" };
        if (!allowedStatuses.Contains(input.ToStatus))
            throw new UserFriendlyException($"'{input.ToStatus}' is not a valid case status.");

        var caseEntity = await Repository.GetAsync(input.Id);
        var fromStatus = caseEntity.Status;

        await _historyRepository.InsertAsync(new CaseStatusHistory
        {
            CaseId = input.Id,
            FromStatus = fromStatus,
            ToStatus = input.ToStatus,
            ChangedAt = DateTime.UtcNow,
            Reason = input.Reason,
        });

        caseEntity.Status = input.ToStatus;
        caseEntity.LastActivityAt = DateTime.UtcNow;

        if (input.ToStatus == "Closed" || input.ToStatus == "Void")
            caseEntity.ClosedAt = DateTime.UtcNow;

        if (input.ToStatus == "PendingTrial")
        {
            caseEntity.IsCourtReady = true;
            caseEntity.CourtReadyAt = DateTime.UtcNow;
        }

        await Repository.UpdateAsync(caseEntity);
        return ObjectMapper.Map<CaseDto>(caseEntity);
    }

    protected override IQueryable<Domains.Case.Case> CreateFilteredQuery(PagedCaseResultRequestDto input)
    {
        return Repository.GetAll()
            .WhereIf(
                !input.Keyword.IsNullOrWhiteSpace(),
                c => c.Title.Contains(input.Keyword) || c.CaseNumber.Contains(input.Keyword)
            )
            .WhereIf(
                !input.Status.IsNullOrWhiteSpace(),
                c => c.Status == input.Status
            )
            .WhereIf(
                !input.Severity.IsNullOrWhiteSpace(),
                c => c.Severity == input.Severity
            );
    }

    private async Task<string> GenerateCaseNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var count = await Repository.GetAll()
            .Where(c => c.OpenedAt.Year == year)
            .CountAsync();
        return $"CAS-{year}-{(count + 1):D5}";
    }
}
