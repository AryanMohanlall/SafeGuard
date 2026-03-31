namespace SafeGuard.ML.IncidentPrediction;

public class IncidentPredictionModelInput
{
    public string Title { get; set; }

    public string Description { get; set; }

    public string Location { get; set; }

    public string DetectedObjects { get; set; }

    public bool Anonymous { get; set; }

    public bool HasAudio { get; set; }

    public bool HasImage { get; set; }

    public float OccurredHour { get; set; }

    public float ReportDelayHours { get; set; }
}
