using System.Collections.Generic;
using System.Threading.Tasks;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.Services.IncidentClusteringService;

public interface IIncidentClusteringService
{
    Task<IncidentClusteringTrainingResultDto> TrainModelAsync(IncidentClusteringTrainingRequestDto input);

    Task<IReadOnlyList<IncidentClusterAssignmentDto>> AssignClustersAsync(IReadOnlyList<IncidentClusteringCandidateDto> incidents);
}
