using System.Threading.Tasks;
using Abp.Application.Services;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.Services.IncidentClusteringService;

public interface IIncidentClusteringAppService : IApplicationService
{
    Task<IncidentClusteringTrainingResultDto> RegenerateModelAsync(RegenerateIncidentClusteringInputDto input);

    Task<SuggestedIncidentCaseGraphDto> GetSuggestedCaseGraphAsync(GetSuggestedCaseGraphInputDto input);
}
