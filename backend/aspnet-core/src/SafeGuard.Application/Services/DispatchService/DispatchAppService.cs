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
using Microsoft.EntityFrameworkCore;
using SafeGuard.Authorization.Roles;
using SafeGuard.Authorization.Users;
using SafeGuard.Domains.Dispatches;
using SafeGuard.Domains.Incidents;
using SafeGuard.Services.DispatchService.Dto;

namespace SafeGuard.Services.DispatchService;

[AbpAuthorize]
public class DispatchAppService
    : AsyncCrudAppService<Dispatch, DispatchDto, Guid, PagedDispatchResultRequestDto, CreateDispatchDto, UpdateDispatchDto>,
      IDispatchAppService
{
    private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Dispatched",
        "EnRoute",
        "OnScene",
        "Cleared",
        "Cancelled"
    };

    private readonly IRepository<Incident, Guid> _incidentRepository;
    private readonly IRepository<Domains.Case.Case, Guid> _caseRepository;
    private readonly IRepository<User, long> _userRepository;
    private readonly IRepository<Role> _roleRepository;

    public DispatchAppService(
        IRepository<Dispatch, Guid> repository,
        IRepository<Incident, Guid> incidentRepository,
        IRepository<Domains.Case.Case, Guid> caseRepository,
        IRepository<User, long> userRepository,
        IRepository<Role> roleRepository)
        : base(repository)
    {
        _incidentRepository = incidentRepository;
        _caseRepository = caseRepository;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
    }

    public override async Task<DispatchDto> CreateAsync(CreateDispatchDto input)
    {
        ValidateStatus(input.Status);

        var incident = await _incidentRepository.GetAsync(input.IncidentId);
        var resolvedCaseId = input.CaseId ?? incident.CaseId;

        if (resolvedCaseId.HasValue)
        {
            await EnsureCaseExistsAsync(resolvedCaseId.Value);
        }

        await EnsureOfficialUserAsync(input.OfficialUserId);

        var entity = ObjectMapper.Map<Dispatch>(input);
        entity.CaseId = resolvedCaseId;
        entity.AssignedAt = input.AssignedAt == default ? DateTime.UtcNow : input.AssignedAt;
        ApplyStatusTimestamps(entity, entity.Status, isCreate: true);

        await Repository.InsertAsync(entity);
        await CurrentUnitOfWork.SaveChangesAsync();

        return await GetAsync(new EntityDto<Guid>(entity.Id));
    }

    public override async Task<DispatchDto> UpdateAsync(UpdateDispatchDto input)
    {
        ValidateStatus(input.Status);

        var entity = await Repository.GetAsync(input.Id);
        var previousStatus = entity.Status;
        ObjectMapper.Map(input, entity);

        var incident = await _incidentRepository.GetAsync(entity.IncidentId);
        entity.CaseId = input.CaseId ?? incident.CaseId;

        if (entity.CaseId.HasValue)
        {
            await EnsureCaseExistsAsync(entity.CaseId.Value);
        }

        await EnsureOfficialUserAsync(input.OfficialUserId);

        ApplyStatusTimestamps(entity, input.Status, isCreate: false, previousStatus);

        await Repository.UpdateAsync(entity);
        return await GetAsync(new EntityDto<Guid>(entity.Id));
    }

    public async Task<DispatchDto> TransitionStatusAsync(TransitionDispatchStatusInput input)
    {
        ValidateStatus(input.ToStatus);

        var entity = await Repository.GetAsync(input.Id);
        ApplyStatusTimestamps(entity, input.ToStatus, isCreate: false, entity.Status);
        entity.Status = input.ToStatus;

        if (!input.Notes.IsNullOrWhiteSpace())
        {
            entity.Notes = input.Notes;
        }

        await Repository.UpdateAsync(entity);
        return await GetAsync(new EntityDto<Guid>(entity.Id));
    }

    public override async Task<DispatchDto> GetAsync(EntityDto<Guid> input)
    {
        var dto = await base.GetAsync(input);
        await EnrichDispatchDtoAsync(dto);
        return dto;
    }

    public override async Task<PagedResultDto<DispatchDto>> GetAllAsync(PagedDispatchResultRequestDto input)
    {
        var result = await base.GetAllAsync(input);
        await EnrichDispatchDtosAsync(result.Items);
        return result;
    }

    protected override IQueryable<Dispatch> CreateFilteredQuery(PagedDispatchResultRequestDto input)
    {
        var activeStatuses = new[] { "Dispatched", "EnRoute", "OnScene" };

        return Repository.GetAll()
            .WhereIf(!input.Keyword.IsNullOrWhiteSpace(),
                d => d.ResponderName.Contains(input.Keyword) ||
                     d.ResponderSector.Contains(input.Keyword) ||
                     d.Status.Contains(input.Keyword))
            .WhereIf(input.IncidentId.HasValue, d => d.IncidentId == input.IncidentId.Value)
            .WhereIf(input.CaseId.HasValue, d => d.CaseId == input.CaseId.Value)
            .WhereIf(!input.Status.IsNullOrWhiteSpace(), d => d.Status == input.Status)
            .WhereIf(input.ActiveOnly, d => activeStatuses.Contains(d.Status));
    }

    protected override IQueryable<Dispatch> ApplySorting(IQueryable<Dispatch> query, PagedDispatchResultRequestDto input)
    {
        return query.OrderByDescending(d => d.AssignedAt);
    }

    private static void ValidateStatus(string status)
    {
        if (!ValidStatuses.Contains(status ?? string.Empty))
        {
            throw new UserFriendlyException($"'{status}' is not a valid dispatch status.");
        }
    }

    private static void ApplyStatusTimestamps(Dispatch entity, string nextStatus, bool isCreate, string previousStatus = null)
    {
        var now = DateTime.UtcNow;

        if (isCreate && entity.AssignedAt == default)
        {
            entity.AssignedAt = now;
        }

        if (string.Equals(nextStatus, previousStatus, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (string.Equals(nextStatus, "EnRoute", StringComparison.OrdinalIgnoreCase) && !entity.EnRouteAt.HasValue)
        {
            entity.EnRouteAt = now;
        }

        if (string.Equals(nextStatus, "OnScene", StringComparison.OrdinalIgnoreCase) && !entity.OnSceneAt.HasValue)
        {
            entity.OnSceneAt = now;
        }

        if ((string.Equals(nextStatus, "Cleared", StringComparison.OrdinalIgnoreCase) ||
             string.Equals(nextStatus, "Cancelled", StringComparison.OrdinalIgnoreCase)) &&
            !entity.ClearedAt.HasValue)
        {
            entity.ClearedAt = now;
        }
    }

    private async Task EnsureCaseExistsAsync(Guid caseId)
    {
        if (!await _caseRepository.GetAll().AnyAsync(c => c.Id == caseId))
        {
            throw new UserFriendlyException("The specified case does not exist.");
        }
    }

    private async Task EnsureOfficialUserAsync(long officialUserId)
    {
        var user = await _userRepository.GetAllIncluding(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Id == officialUserId);

        if (user == null)
        {
            throw new UserFriendlyException("The specified official user does not exist.");
        }

        var roleIds = user.Roles.Select(role => role.RoleId).ToList();
        if (roleIds.Count == 0)
        {
            throw new UserFriendlyException($"User '{user.FullName}' is not assigned to the '{StaticRoleNames.Tenants.Offical}' role.");
        }

        var hasOfficalRole = await _roleRepository.GetAll()
            .AnyAsync(role => roleIds.Contains(role.Id) && role.Name == StaticRoleNames.Tenants.Offical);

        if (!hasOfficalRole)
        {
            throw new UserFriendlyException($"User '{user.FullName}' is not assigned to the '{StaticRoleNames.Tenants.Offical}' role.");
        }
    }

    private async Task EnrichDispatchDtoAsync(DispatchDto dto)
    {
        var incident = await _incidentRepository.GetAll()
            .Where(i => i.Id == dto.IncidentId)
            .Select(i => new { i.Title, i.CaseId })
            .FirstOrDefaultAsync();

        dto.IncidentTitle = incident?.Title;

        if (dto.CaseId.HasValue)
        {
            dto.CaseNumber = await _caseRepository.GetAll()
                .Where(c => c.Id == dto.CaseId.Value)
                .Select(c => c.CaseNumber)
                .FirstOrDefaultAsync();
        }

        if (dto.OfficialUserId.HasValue)
        {
            dto.OfficialFullName = await _userRepository.GetAll()
                .Where(u => u.Id == dto.OfficialUserId.Value)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync();
        }
    }

    private async Task EnrichDispatchDtosAsync(IReadOnlyList<DispatchDto> dtos)
    {
        var incidentIds = dtos.Select(d => d.IncidentId).Distinct().ToList();
        var caseIds = dtos.Where(d => d.CaseId.HasValue).Select(d => d.CaseId.Value).Distinct().ToList();
        var officialUserIds = dtos.Where(d => d.OfficialUserId.HasValue).Select(d => d.OfficialUserId.Value).Distinct().ToList();

        var incidents = await _incidentRepository.GetAll()
            .Where(i => incidentIds.Contains(i.Id))
            .Select(i => new { i.Id, i.Title })
            .ToDictionaryAsync(i => i.Id, i => i.Title);

        var caseNumbers = await _caseRepository.GetAll()
            .Where(c => caseIds.Contains(c.Id))
            .Select(c => new { c.Id, c.CaseNumber })
            .ToDictionaryAsync(c => c.Id, c => c.CaseNumber);

        var officialNames = await _userRepository.GetAll()
            .Where(u => officialUserIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FullName })
            .ToDictionaryAsync(u => u.Id, u => u.FullName);

        foreach (var dto in dtos)
        {
            if (incidents.TryGetValue(dto.IncidentId, out var incidentTitle))
            {
                dto.IncidentTitle = incidentTitle;
            }

            if (dto.CaseId.HasValue && caseNumbers.TryGetValue(dto.CaseId.Value, out var caseNumber))
            {
                dto.CaseNumber = caseNumber;
            }

            if (dto.OfficialUserId.HasValue && officialNames.TryGetValue(dto.OfficialUserId.Value, out var officialName))
            {
                dto.OfficialFullName = officialName;
            }
        }
    }
}
