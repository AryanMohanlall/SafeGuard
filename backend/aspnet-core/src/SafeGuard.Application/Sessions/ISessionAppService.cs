using Abp.Application.Services;
using SafeGuard.Sessions.Dto;
using System.Threading.Tasks;

namespace SafeGuard.Sessions;

public interface ISessionAppService : IApplicationService
{
    Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
}
