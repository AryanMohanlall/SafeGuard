namespace SafeGuard.Services.IncidentPredictionService.Dto;

public class IncidentPredictionResultDto
{
    public bool IsHighPriority { get; set; }

    public float Probability { get; set; }

    public float Score { get; set; }
}
