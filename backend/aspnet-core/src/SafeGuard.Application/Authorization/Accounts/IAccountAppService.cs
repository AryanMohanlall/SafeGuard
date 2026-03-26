using Abp.Application.Services;
using SafeGuard.Authorization.Accounts.Dto;
using System.Threading.Tasks;

namespace SafeGuard.Authorization.Accounts;

public interface IAccountAppService : IApplicationService
{
    Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

    Task<RegisterOutput> Register(RegisterInput input);
}
