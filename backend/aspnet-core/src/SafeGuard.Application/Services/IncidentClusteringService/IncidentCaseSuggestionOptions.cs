namespace SafeGuard.Services.IncidentClusteringService;

public class IncidentCaseSuggestionOptions
{
    public int MinimumIncidentCount { get; set; } = 2;

    public double MaximumTimeSpanHours { get; set; } = 72d;

    public double MaximumClusterRadiusKm { get; set; } = 20d;

    public double MinimumConfidenceScore { get; set; } = 0.55d;

    public double SizeWeight { get; set; } = 0.2d;

    public double TimeWeight { get; set; } = 0.25d;

    public double GeoWeight { get; set; } = 0.25d;

    public double CategoryWeight { get; set; } = 0.15d;

    public double ObjectWeight { get; set; } = 0.15d;
}
