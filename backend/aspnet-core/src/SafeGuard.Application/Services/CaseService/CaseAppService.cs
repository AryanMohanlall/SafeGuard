using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.UI;
using Abp.Runtime.Session;
using SafeGuard.Domains.Incidents;
using Microsoft.EntityFrameworkCore;
using SafeGuard.Domains.Case;
using SafeGuard.Domains.Evidence;
using SafeGuard.Services.CaseService.Dto;

namespace SafeGuard.Services.CaseService;

[AbpAuthorize]
public class CaseAppService
    : AsyncCrudAppService<Domains.Case.Case, CaseDto, Guid, PagedCaseResultRequestDto, CreateCaseDto, UpdateCaseDto>,
      ICaseAppService
{
    private readonly IRepository<CaseStatusHistory, Guid> _historyRepository;
    private readonly IRepository<Incident, Guid> _incidentRepository;
    private readonly IIncidentEvidenceService _incidentEvidenceService;

    public CaseAppService(
        IRepository<Domains.Case.Case, Guid> repository,
        IRepository<CaseStatusHistory, Guid> historyRepository,
        IRepository<Incident, Guid> incidentRepository,
        IIncidentEvidenceService incidentEvidenceService)
        : base(repository)
    {
        _historyRepository = historyRepository;
        _incidentRepository = incidentRepository;
        _incidentEvidenceService = incidentEvidenceService;
    }

    public override async Task<CaseDto> CreateAsync(CreateCaseDto input)
    {
        // Auto-generate CaseNumber before mapping
        var caseEntity = ObjectMapper.Map<Domains.Case.Case>(input);
        caseEntity.CaseNumber = await GenerateCaseNumberAsync();
        caseEntity.LastActivityAt = DateTime.UtcNow;

        await Repository.InsertAsync(caseEntity);
        await CurrentUnitOfWork.SaveChangesAsync();
        await AssignIncidentsToCaseAsync(caseEntity.Id, input.IncidentIds);

        return await GetAsync(new EntityDto<Guid>(caseEntity.Id));
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
        await AssignIncidentsToCaseAsync(caseEntity.Id, input.IncidentIds);
        return await GetAsync(new EntityDto<Guid>(caseEntity.Id));
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
        return await GetAsync(new EntityDto<Guid>(caseEntity.Id));
    }

    public override async Task<CaseDto> GetAsync(EntityDto<Guid> input)
    {
        var dto = await base.GetAsync(input);
        await EnrichCaseDtoAsync(dto);
        return dto;
    }

    public override async Task<PagedResultDto<CaseDto>> GetAllAsync(PagedCaseResultRequestDto input)
    {
        var result = await base.GetAllAsync(input);
        await EnrichCaseDtosAsync(result.Items);
        return result;
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

    private async Task AssignIncidentsToCaseAsync(Guid caseId, IReadOnlyCollection<Guid> requestedIncidentIds)
    {
        var normalizedIds = requestedIncidentIds?
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList() ?? new List<Guid>();

        var currentlyLinked = await _incidentRepository.GetAll()
            .Where(i => i.CaseId == caseId)
            .ToListAsync();

        var incidentsToUnlink = currentlyLinked
            .Where(i => !normalizedIds.Contains(i.Id))
            .ToList();

        foreach (var incident in incidentsToUnlink)
        {
            incident.CaseId = null;
            await _incidentRepository.UpdateAsync(incident);
        }

        if (normalizedIds.Count == 0)
        {
            return;
        }

        var incidentsToLink = await _incidentRepository.GetAll()
            .Where(i => normalizedIds.Contains(i.Id))
            .ToListAsync();

        if (incidentsToLink.Count != normalizedIds.Count)
        {
            throw new UserFriendlyException("One or more incident IDs do not exist.");
        }

        var conflictingIncident = incidentsToLink
            .FirstOrDefault(i => i.CaseId.HasValue && i.CaseId.Value != caseId);

        if (conflictingIncident != null)
        {
            throw new UserFriendlyException(
                $"Incident '{conflictingIncident.Id}' is already linked to another case.");
        }

        foreach (var incident in incidentsToLink)
        {
            if (incident.CaseId != caseId)
            {
                incident.CaseId = caseId;
                await _incidentRepository.UpdateAsync(incident);
            }

            await _incidentEvidenceService.SyncIncidentEvidenceAsync(
                caseId,
                incident,
                AbpSession.UserId);
        }
    }

    private async Task EnrichCaseDtoAsync(CaseDto dto)
    {
        var incidentIds = await _incidentRepository.GetAll()
            .Where(i => i.CaseId == dto.Id)
            .OrderBy(i => i.ReportedAt)
            .Select(i => i.Id)
            .ToListAsync();

        dto.IncidentIds = incidentIds;
        dto.IncidentCount = incidentIds.Count;
    }

    private async Task EnrichCaseDtosAsync(IReadOnlyList<CaseDto> dtos)
    {
        var caseIds = dtos.Select(d => d.Id).ToList();
        if (caseIds.Count == 0)
        {
            return;
        }

        var incidentPairs = await _incidentRepository.GetAll()
            .Where(i => i.CaseId.HasValue && caseIds.Contains(i.CaseId.Value))
            .OrderBy(i => i.ReportedAt)
            .Select(i => new { CaseId = i.CaseId.Value, i.Id })
            .ToListAsync();

        var incidentLookup = incidentPairs
            .GroupBy(x => x.CaseId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Id).ToList());

        foreach (var dto in dtos)
        {
            if (incidentLookup.TryGetValue(dto.Id, out var incidentIds))
            {
                dto.IncidentIds = incidentIds;
                dto.IncidentCount = incidentIds.Count;
            }
            else
            {
                dto.IncidentIds = new List<Guid>();
                dto.IncidentCount = 0;
            }
        }
    }
}
