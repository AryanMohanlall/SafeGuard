using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using SafeGuard.Services.RoadblockService.Dto;

namespace SafeGuard.Services.RoadblockService;

public interface IRoadblockAppService : IApplicationService
{
    Task<ListResultDto<RoadblockDto>> GetLiveAsync(GetRoadblocksInput input);
}
