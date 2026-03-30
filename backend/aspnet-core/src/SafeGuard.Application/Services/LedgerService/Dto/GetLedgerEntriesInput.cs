using Abp.Application.Services.Dto;

namespace SafeGuard.Services.LedgerService.Dto;

public class GetLedgerEntriesInput : PagedResultRequestDto
{
    public string EntityType { get; set; }
    public string EntityId { get; set; }
}
