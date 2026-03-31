using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using Microsoft.VisualBasic.FileIO;
using SafeGuard.Services.IncidentClusteringService;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.ML.IncidentClustering;

public class CsvIncidentClusteringReader
{
    private static readonly string[] DateFormats =
    [
        "yyyy-MM-dd HH:mm:ss",
        "yyyy-MM-ddTHH:mm:ss",
        "yyyy-MM-ddTHH:mm:ssZ",
        "dd/MM/yyyy HH:mm:ss",
        "dd/MM/yyyy"
    ];

    public IReadOnlyList<IncidentClusteringCandidateDto> Read(string csvPath)
    {
        if (!File.Exists(csvPath))
        {
            throw new FileNotFoundException("Training data file was not found.", csvPath);
        }

        using var parser = new TextFieldParser(csvPath);
        parser.TextFieldType = FieldType.Delimited;
        parser.SetDelimiters(",");
        parser.HasFieldsEnclosedInQuotes = true;

        var headers = parser.ReadFields();
        if (headers == null || headers.Length == 0)
        {
            throw new InvalidOperationException("Training data file is empty.");
        }

        var index = BuildHeaderIndex(headers);
        var results = new List<IncidentClusteringCandidateDto>();

        while (!parser.EndOfData)
        {
            var fields = parser.ReadFields();
            if (fields == null || fields.Length == 0)
            {
                continue;
            }

            var incidentId = ParseGuid(GetValue(fields, index, "id"));
            var occurredAt = ParseDate(GetValue(fields, index, "occurred_at"));
            var reportedAt = ParseDate(GetValue(fields, index, "reported_at"));

            results.Add(new IncidentClusteringCandidateDto
            {
                IncidentId = incidentId == Guid.Empty ? Guid.NewGuid() : incidentId,
                CaseId = ParseGuidNullable(GetValue(fields, index, "case_id")),
                Title = GetValue(fields, index, "title"),
                Location = GetValue(fields, index, "location"),
                DetectedObjects = GetValue(fields, index, "detected_objects"),
                Latitude = ParseDecimalNullable(GetValue(fields, index, "latitude")),
                Longitude = ParseDecimalNullable(GetValue(fields, index, "longitude")),
                OccurredAt = occurredAt ?? DateTime.UtcNow,
                ReportedAt = reportedAt ?? occurredAt ?? DateTime.UtcNow
            });
        }

        if (results.Count == 0)
        {
            throw new InvalidOperationException("Training data file does not contain any usable rows.");
        }

        return results;
    }

    public IncidentClusteringModelInput MapToModelInput(IncidentClusteringCandidateDto incident)
    {
        var hasCoordinates = incident.Latitude.HasValue && incident.Longitude.HasValue;

        return new IncidentClusteringModelInput
        {
            TitleText = incident.Title ?? string.Empty,
            CategoryText = IncidentFeatureTextNormalizer.DeriveCategory(incident.Title),
            LocationText = IncidentFeatureTextNormalizer.NormalizeLocation(incident.Location),
            DetectedObjectsText = IncidentFeatureTextNormalizer.NormalizeDetectedObjects(incident.DetectedObjects),
            Latitude = hasCoordinates ? (float)incident.Latitude.Value : 0f,
            Longitude = hasCoordinates ? (float)incident.Longitude.Value : 0f,
            HasCoordinates = hasCoordinates ? 1f : 0f,
            HourOfDay = incident.OccurredAt.Hour,
            DayOfWeek = (float)incident.OccurredAt.DayOfWeek,
            IsWeekend = incident.OccurredAt.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday ? 1f : 0f
        };
    }

    private static Dictionary<string, int> BuildHeaderIndex(IReadOnlyList<string> headers)
    {
        var index = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < headers.Count; i++)
        {
            index[headers[i]] = i;
        }

        return index;
    }

    private static string GetValue(IReadOnlyList<string> fields, IReadOnlyDictionary<string, int> index, string columnName)
    {
        if (!index.TryGetValue(columnName, out var position) || position >= fields.Count)
        {
            return string.Empty;
        }

        return fields[position] ?? string.Empty;
    }

    private static DateTime? ParseDate(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        if (DateTime.TryParseExact(raw, DateFormats, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var exact))
        {
            return DateTime.SpecifyKind(exact, DateTimeKind.Utc);
        }

        if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed))
        {
            return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);
        }

        return null;
    }

    private static decimal? ParseDecimalNullable(string raw)
    {
        return decimal.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed)
            ? parsed
            : null;
    }

    private static Guid ParseGuid(string raw)
    {
        return Guid.TryParse(raw, out var parsed) ? parsed : Guid.Empty;
    }

    private static Guid? ParseGuidNullable(string raw)
    {
        return Guid.TryParse(raw, out var parsed) ? parsed : null;
    }
}
