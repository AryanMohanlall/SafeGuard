using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using SafeGuard.Services.IncidentPredictionService.Dto;

namespace SafeGuard.Services.IncidentPredictionService;

public interface IIncidentPredictionAppService : IApplicationService
{
    Task<IncidentPredictionResultDto> PredictAsync(IncidentPredictionRequestDto input);

    Task<IncidentPredictionResultDto> PredictForIncidentAsync(Guid incidentId);
}
