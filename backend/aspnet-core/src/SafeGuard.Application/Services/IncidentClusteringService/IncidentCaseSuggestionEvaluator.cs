using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.Services.IncidentClusteringService;

public class IncidentCaseSuggestionEvaluator
{
    private readonly IncidentCaseSuggestionOptions _options;

    public IncidentCaseSuggestionEvaluator(IncidentCaseSuggestionOptions options)
    {
        _options = options;
    }

    public SuggestedIncidentCaseDto Evaluate(int clusterId, IReadOnlyList<IncidentClusteringCandidateDto> incidents)
    {
        if (incidents == null || incidents.Count == 0)
        {
            return null;
        }

        if (incidents.Count < _options.MinimumIncidentCount)
        {
            return null;
        }

        var orderedIncidents = incidents.OrderBy(i => i.OccurredAt).ToList();
        var categories = orderedIncidents
            .Select(i => IncidentFeatureTextNormalizer.DeriveCategory(i.Title))
            .ToList();
        var categorySummary = BuildDominantSummary(categories, "uncategorized");

        var objectTokens = orderedIncidents
            .SelectMany(i => IncidentFeatureTextNormalizer.ParseDetectedObjects(i.DetectedObjects))
            .ToList();
        var objectSummary = BuildDominantSummary(objectTokens, "mixed objects");

        var timeSpanHours = Math.Max(0d, (orderedIncidents[^1].OccurredAt - orderedIncidents[0].OccurredAt).TotalHours);
        var maxDistanceKm = CalculateMaxDistanceKm(orderedIncidents);

        var sizeScore = Clamp(orderedIncidents.Count / (double)(_options.MinimumIncidentCount + 2));
        var timeScore = InverseWindowScore(timeSpanHours, _options.MaximumTimeSpanHours);
        var geoScore = InverseWindowScore(maxDistanceKm, _options.MaximumClusterRadiusKm);
        var categoryScore = categorySummary.ratio;
        var objectScore = objectTokens.Count == 0 ? 0.5d : objectSummary.ratio;

        var weightedScore =
            (sizeScore * _options.SizeWeight) +
            (timeScore * _options.TimeWeight) +
            (geoScore * _options.GeoWeight) +
            (categoryScore * _options.CategoryWeight) +
            (objectScore * _options.ObjectWeight);

        if (weightedScore < _options.MinimumConfidenceScore)
        {
            return null;
        }

        var existingCaseIds = orderedIncidents
            .Where(i => i.CaseId.HasValue)
            .Select(i => i.CaseId.Value)
            .Distinct()
            .ToList();

        if (existingCaseIds.Count == 1 && orderedIncidents.All(i => i.CaseId == existingCaseIds[0]))
        {
            return null;
        }

        var anchor = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(
            IncidentFeatureTextNormalizer.BuildLocationAnchor(orderedIncidents[0].Location));

        var suggestedTitle = $"{ToDisplayText(categorySummary.value)} pattern near {anchor}";
        var reasons = BuildReasons(orderedIncidents.Count, timeSpanHours, maxDistanceKm, categorySummary, objectSummary);
        var confidence = (float)Math.Round(weightedScore, 3, MidpointRounding.AwayFromZero);

        return new SuggestedIncidentCaseDto
        {
            Id = $"suggestion-{clusterId}",
            GroupId = $"cluster-{clusterId}",
            ClusterId = clusterId,
            SuggestedTitle = suggestedTitle,
            DominantCategory = ToDisplayText(categorySummary.value),
            DominantObject = ToDisplayText(objectSummary.value),
            ConfidenceScore = confidence,
            TimeSpanHours = Math.Round(timeSpanHours, 2, MidpointRounding.AwayFromZero),
            MaxDistanceKm = Math.Round(maxDistanceKm, 2, MidpointRounding.AwayFromZero),
            IncidentIds = orderedIncidents.Select(i => i.IncidentId).ToList(),
            ExistingCaseIds = existingCaseIds,
            Reasons = reasons
        };
    }

    private static (string value, float ratio) BuildDominantSummary(IReadOnlyList<string> values, string fallback)
    {
        if (values == null || values.Count == 0)
        {
            return (fallback, 0f);
        }

        var dominantGroup = values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .GroupBy(value => value, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key)
            .FirstOrDefault();

        if (dominantGroup == null)
        {
            return (fallback, 0f);
        }

        return (dominantGroup.Key, (float)dominantGroup.Count() / values.Count);
    }

    private static IReadOnlyList<string> BuildReasons(
        int incidentCount,
        double timeSpanHours,
        double maxDistanceKm,
        (string value, float ratio) categorySummary,
        (string value, float ratio) objectSummary)
    {
        return new[]
        {
            $"{incidentCount} incidents landed in the same ML cluster.",
            $"Incidents occurred within {Math.Round(timeSpanHours, 1, MidpointRounding.AwayFromZero)} hours.",
            $"Maximum spread from the cluster center is {Math.Round(maxDistanceKm, 1, MidpointRounding.AwayFromZero)} km.",
            $"Top title/category pattern: {ToDisplayText(categorySummary.value)} ({Math.Round(categorySummary.ratio * 100f)}%).",
            $"Most common detected object: {ToDisplayText(objectSummary.value)} ({Math.Round(objectSummary.ratio * 100f)}%)."
        };
    }

    private static double CalculateMaxDistanceKm(IReadOnlyList<IncidentClusteringCandidateDto> incidents)
    {
        var geoIncidents = incidents
            .Where(i => i.Latitude.HasValue && i.Longitude.HasValue)
            .ToList();

        if (geoIncidents.Count < 2)
        {
            return 0d;
        }

        var centerLat = geoIncidents.Average(i => (double)i.Latitude.Value);
        var centerLon = geoIncidents.Average(i => (double)i.Longitude.Value);

        return geoIncidents
            .Max(i => HaversineKm(centerLat, centerLon, (double)i.Latitude.Value, (double)i.Longitude.Value));
    }

    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371d;
        var latDelta = DegreesToRadians(lat2 - lat1);
        var lonDelta = DegreesToRadians(lon2 - lon1);
        var a =
            Math.Pow(Math.Sin(latDelta / 2d), 2d) +
            Math.Cos(DegreesToRadians(lat1)) *
            Math.Cos(DegreesToRadians(lat2)) *
            Math.Pow(Math.Sin(lonDelta / 2d), 2d);
        var c = 2d * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1d - a));
        return earthRadiusKm * c;
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * Math.PI / 180d;
    }

    private static double InverseWindowScore(double value, double threshold)
    {
        if (threshold <= 0d)
        {
            return value <= 0d ? 1d : 0d;
        }

        if (value <= threshold)
        {
            return 1d;
        }

        return Clamp(1d - ((value - threshold) / threshold));
    }

    private static double Clamp(double value)
    {
        return Math.Max(0d, Math.Min(1d, value));
    }

    private static string ToDisplayText(string value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? "Unknown"
            : value.Replace('_', ' ');
    }
}
