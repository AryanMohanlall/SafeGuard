using Abp.Application.Services;
using Abp.Application.Services.Dto;
using SafeGuard.Users.Dto;
using System.Threading.Tasks;

namespace SafeGuard.Users;

public interface IOfficialDirectoryAppService : IApplicationService
{
    Task<ListResultDto<UserDto>> GetOfficials();
}
