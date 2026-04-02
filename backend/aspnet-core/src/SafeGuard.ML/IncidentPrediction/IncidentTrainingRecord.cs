namespace SafeGuard.ML.IncidentPrediction;

public class IncidentTrainingRecord : IncidentPredictionModelInput
{
    public bool Label { get; set; }
    public string CrimeCategory { get; set; }
    public float DayOfWeek { get; set; }
    public float IsWeekend { get; set; }
    public float IsNighttime { get; set; }
}
