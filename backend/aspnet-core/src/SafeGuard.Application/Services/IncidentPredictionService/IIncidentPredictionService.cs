using System.Threading.Tasks;
using SafeGuard.Services.IncidentPredictionService.Dto;

namespace SafeGuard.Services.IncidentPredictionService;

public interface IIncidentPredictionService
{
    Task<IncidentPredictionResultDto> PredictAsync(IncidentPredictionRequestDto input);
}
