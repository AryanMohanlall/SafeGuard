using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using SafeGuard.Services.LedgerService.Dto;

namespace SafeGuard.Services.LedgerService;

public interface ILedgerAppService : IApplicationService
{
    Task<PagedResultDto<LedgerEntryDto>> GetAllAsync(GetLedgerEntriesInput input);
    Task<LedgerEntryDto> GetAsync(EntityDto<Guid> input);
    Task<LedgerEntryDto> AppendAsync(AppendLedgerEntryDto input);
    Task<ChainVerificationResultDto> VerifyChainAsync();
}
