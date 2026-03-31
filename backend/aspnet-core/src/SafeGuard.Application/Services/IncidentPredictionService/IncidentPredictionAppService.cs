using System;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Domain.Repositories;
using SafeGuard.Domains.Incidents;
using SafeGuard.Services.IncidentPredictionService.Dto;

namespace SafeGuard.Services.IncidentPredictionService;

[AbpAuthorize]
public class IncidentPredictionAppService : SafeGuardAppServiceBase, IIncidentPredictionAppService
{
    private readonly IRepository<Incident, Guid> _incidentRepository;
    private readonly IIncidentPredictionService _incidentPredictionService;

    public IncidentPredictionAppService(
        IRepository<Incident, Guid> incidentRepository,
        IIncidentPredictionService incidentPredictionService)
    {
        _incidentRepository = incidentRepository;
        _incidentPredictionService = incidentPredictionService;
    }

    public Task<IncidentPredictionResultDto> PredictAsync(IncidentPredictionRequestDto input)
    {
        return _incidentPredictionService.PredictAsync(input);
    }

    public async Task<IncidentPredictionResultDto> PredictForIncidentAsync(Guid incidentId)
    {
        var incident = await _incidentRepository.GetAsync(incidentId);

        return await _incidentPredictionService.PredictAsync(new IncidentPredictionRequestDto
        {
            Title = incident.Title,
            Description = incident.Description,
            Location = incident.Location,
            Anonymous = incident.Anonymous,
            HasAudio = incident.AudioFile != null && incident.AudioFile.Length > 0,
            HasImage = incident.ImageFile != null && incident.ImageFile.Length > 0,
            DetectedObjects = incident.DetectedObjects,
            OccurredAt = incident.OccurredAt,
            ReportedAt = incident.ReportedAt
        });
    }
}
