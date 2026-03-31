using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Microsoft.EntityFrameworkCore;
using SafeGuard.Services.LedgerService.Dto;

namespace SafeGuard.Services.LedgerService;

[AbpAuthorize]
public class LedgerAppService : SafeGuardAppServiceBase, ILedgerAppService
{
    private readonly IRepository<Domains.Blockchain.LedgerEntry, Guid> _ledgerRepository;
    private readonly Domains.Blockchain.ILedgerService _ledgerService;

    public LedgerAppService(
        IRepository<Domains.Blockchain.LedgerEntry, Guid> ledgerRepository,
        Domains.Blockchain.ILedgerService ledgerService)
    {
        _ledgerRepository = ledgerRepository;
        _ledgerService = ledgerService;
    }

    public async Task<PagedResultDto<LedgerEntryDto>> GetAllAsync(GetLedgerEntriesInput input)
    {
        var query = _ledgerRepository.GetAll()
            .WhereIf(
                !input.EntityType.IsNullOrWhiteSpace(),
                e => e.EntityType == input.EntityType)
            .WhereIf(
                !input.EntityId.IsNullOrWhiteSpace(),
                e => e.EntityId == input.EntityId);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(e => e.RecordedAt)
            .PageBy(input)
            .ToListAsync();

        return new PagedResultDto<LedgerEntryDto>(
            totalCount,
            ObjectMapper.Map<System.Collections.Generic.List<LedgerEntryDto>>(items));
    }

    public async Task<LedgerEntryDto> GetAsync(EntityDto<Guid> input)
    {
        var entry = await _ledgerRepository.GetAsync(input.Id);
        return ObjectMapper.Map<LedgerEntryDto>(entry);
    }

    public async Task<LedgerEntryDto> AppendAsync(AppendLedgerEntryDto input)
    {
        var actorUserId = input.ActorUserId ?? AbpSession.UserId;
        var entry = await _ledgerService.AppendAsync(
            input.EntityType,
            input.EntityId,
            input.Action,
            input.Payload,
            actorUserId);

        await CurrentUnitOfWork.SaveChangesAsync();

        return ObjectMapper.Map<LedgerEntryDto>(entry);
    }

    public async Task<ChainVerificationResultDto> VerifyChainAsync()
    {
        var result = await _ledgerService.VerifyChainAsync();

        return new ChainVerificationResultDto
        {
            IsValid = result.IsValid,
            TotalEntries = result.TotalEntries,
            FirstTamperedIndex = result.FirstTamperedIndex,
            FailureReason = result.FailureReason
        };
    }
}
