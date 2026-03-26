using Abp.Application.Services;
using SafeGuard.MultiTenancy.Dto;

namespace SafeGuard.MultiTenancy;

public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
{
}

