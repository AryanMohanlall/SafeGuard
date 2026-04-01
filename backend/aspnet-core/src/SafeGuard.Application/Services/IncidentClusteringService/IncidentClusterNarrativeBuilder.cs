using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.Services.IncidentClusteringService;

public static class IncidentClusterNarrativeBuilder
{
    public static IncidentClusterNarrative Build(
        IReadOnlyList<IncidentClusteringCandidateDto> incidents,
        string dominantCategory,
        string dominantObject)
    {
        var area = BuildDominantArea(incidents);
        var timeBand = BuildTimeBand(incidents);

        var categoryDisplay = ToDisplayText(dominantCategory, "Linked Incidents");
        var objectDisplay = ToDisplayText(dominantObject, "Mixed Objects");

        var hasCategory = !string.IsNullOrWhiteSpace(dominantCategory)
            && !string.Equals(dominantCategory, "uncategorized", StringComparison.OrdinalIgnoreCase);
        var hasObject = !string.IsNullOrWhiteSpace(dominantObject)
            && !string.Equals(dominantObject, "mixed objects", StringComparison.OrdinalIgnoreCase);
        var hasArea = !string.Equals(area, "Unknown Area", StringComparison.OrdinalIgnoreCase);
        var hasTimeBand = !string.Equals(timeBand, "Mixed Hours", StringComparison.OrdinalIgnoreCase);

        var labelParts = new List<string>();
        if (hasCategory)
        {
            labelParts.Add(categoryDisplay);
        }
        else if (hasObject)
        {
            labelParts.Add($"Incidents Involving {objectDisplay}");
        }
        else
        {
            labelParts.Add("Linked Incidents");
        }

        if (hasCategory && hasObject)
        {
            labelParts.Add($"Involving {objectDisplay}");
        }

        if (hasArea)
        {
            labelParts.Add($"Near {area}");
        }

        if (hasTimeBand)
        {
            labelParts.Add($"During {timeBand}");
        }

        var clusterLabel = hasCategory && hasArea
            ? $"{categoryDisplay} - {area}"
            : hasCategory && hasObject
                ? $"{categoryDisplay} - {objectDisplay}"
                : hasCategory
                    ? categoryDisplay
                    : hasObject && hasArea
                        ? $"{objectDisplay} - {area}"
                        : hasArea
                            ? $"Linked Incidents - {area}"
                            : "Linked Incidents";

        var subtitleParts = new List<string>();
        if (hasTimeBand)
        {
            subtitleParts.Add(timeBand);
        }

        if (hasObject)
        {
            subtitleParts.Add(objectDisplay);
        }

        if (subtitleParts.Count == 0)
        {
            subtitleParts.Add("Mixed Signals");
        }

        return new IncidentClusterNarrative
        {
            SuggestedTitle = string.Join(' ', labelParts),
            ClusterLabel = clusterLabel,
            DominantCategoryDisplay = categoryDisplay,
            DominantObjectDisplay = objectDisplay,
            AreaDisplay = area,
            TimeBandDisplay = timeBand,
            ClusterSubtitle = string.Join(" - ", subtitleParts)
        };
    }

    public static string ToDisplayText(string value, string fallback = "Unknown")
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return fallback;
        }

        var normalized = value.Replace('_', ' ').Trim();
        if (normalized.Length == 0)
        {
            return fallback;
        }

        return CultureInfo.InvariantCulture.TextInfo.ToTitleCase(normalized.ToLowerInvariant());
    }

    private static string BuildDominantArea(IReadOnlyList<IncidentClusteringCandidateDto> incidents)
    {
        if (incidents == null || incidents.Count == 0)
        {
            return "Unknown Area";
        }

        var dominantLocation = incidents
            .Select(incident => IncidentFeatureTextNormalizer.BuildLocationAnchor(incident.Location))
            .Where(anchor => !string.IsNullOrWhiteSpace(anchor) && !string.Equals(anchor, "unknown area", StringComparison.OrdinalIgnoreCase))
            .GroupBy(anchor => anchor, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key)
            .Select(group => group.Key)
            .FirstOrDefault();

        return dominantLocation == null
            ? "Unknown Area"
            : CultureInfo.InvariantCulture.TextInfo.ToTitleCase(dominantLocation);
    }

    private static string BuildTimeBand(IReadOnlyList<IncidentClusteringCandidateDto> incidents)
    {
        if (incidents == null || incidents.Count == 0)
        {
            return "Mixed Hours";
        }

        var dominantTimeBand = incidents
            .Select(incident => ToTimeBand(incident.OccurredAt))
            .GroupBy(timeBand => timeBand, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key)
            .First();

        var ratio = (double)dominantTimeBand.Count() / incidents.Count;
        return ratio >= 0.5d ? dominantTimeBand.Key : "Mixed Hours";
    }

    private static string ToTimeBand(DateTime occurredAt)
    {
        var hour = occurredAt.Hour;
        return hour switch
        {
            >= 5 and < 12 => "Morning",
            >= 12 and < 17 => "Afternoon",
            >= 17 and < 22 => "Evening",
            _ => "Overnight"
        };
    }
}

public class IncidentClusterNarrative
{
    public string SuggestedTitle { get; set; }

    public string ClusterLabel { get; set; }

    public string DominantCategoryDisplay { get; set; }

    public string DominantObjectDisplay { get; set; }

    public string AreaDisplay { get; set; }

    public string TimeBandDisplay { get; set; }

    public string ClusterSubtitle { get; set; }
}
