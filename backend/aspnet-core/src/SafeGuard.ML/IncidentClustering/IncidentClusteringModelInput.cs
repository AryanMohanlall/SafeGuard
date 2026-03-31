namespace SafeGuard.ML.IncidentClustering;

public class IncidentClusteringModelInput
{
    public string TitleText { get; set; }

    public string CategoryText { get; set; }

    public string LocationText { get; set; }

    public string DetectedObjectsText { get; set; }

    public float Latitude { get; set; }

    public float Longitude { get; set; }

    public float HasCoordinates { get; set; }

    public float HourOfDay { get; set; }

    public float DayOfWeek { get; set; }

    public float IsWeekend { get; set; }
}
