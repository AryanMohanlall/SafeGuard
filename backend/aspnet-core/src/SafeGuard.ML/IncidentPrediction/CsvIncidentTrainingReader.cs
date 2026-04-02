using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using Microsoft.VisualBasic.FileIO;

namespace SafeGuard.ML.IncidentPrediction;

public class CsvIncidentTrainingReader
{
    private static readonly string[] DateFormats =
    [
        "dd/MM/yyyy",
        "d/M/yyyy",
        "yyyy-MM-dd",
        "yyyy-MM-ddTHH:mm:ss",
        "yyyy-MM-ddTHH:mm:ssZ",
        "yyyy-MM-dd HH:mm:ss"
    ];

    public IReadOnlyList<IncidentTrainingRecord> Read(string csvPath, string labelColumnName)
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
        if (!index.ContainsKey(labelColumnName))
        {
            throw new InvalidOperationException(
                $"Training data must include a '{labelColumnName}' column containing true/false labels.");
        }

        var results = new List<IncidentTrainingRecord>();
        while (!parser.EndOfData)
        {
            var fields = parser.ReadFields();
            if (fields == null || fields.Length == 0)
            {
                continue;
            }

            var occurredAt = ParseDate(fields, index, "occurred_at");
            var reportedAt = ParseDate(fields, index, "reported_at");

            results.Add(new IncidentTrainingRecord
            {
                Title           = GetValue(fields, index, "title"),
                Description     = GetValue(fields, index, "description"),
                Location        = GetValue(fields, index, "location"),
                DetectedObjects = GetValue(fields, index, "detected_objects"),
                CrimeCategory   = GetValue(fields, index, "crime_category"), 
                Anonymous       = ParseBool(GetValue(fields, index, "anonymous")),
                HasAudio        = !string.IsNullOrWhiteSpace(GetValue(fields, index, "audio_file")),
                HasImage        = !string.IsNullOrWhiteSpace(GetValue(fields, index, "image_file")),
                OccurredHour    = occurredAt.Hour,
                DayOfWeek       = (float)occurredAt.DayOfWeek,
                IsWeekend       = occurredAt.DayOfWeek is DayOfWeek.Saturday
                                or DayOfWeek.Sunday ? 1f : 0f,
                IsNighttime     = occurredAt.Hour >= 22 || occurredAt.Hour <= 4 ? 1f : 0f,
                ReportDelayHours = (float)Math.Max(0, (reportedAt - occurredAt).TotalHours),
                Label           = ParseBool(GetValue(fields, index, labelColumnName))
            });
        }

        if (results.Count == 0)
        {
            throw new InvalidOperationException("Training data file does not contain any data rows.");
        }

        return results;
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

    private static DateTime ParseDate(IReadOnlyList<string> fields, IReadOnlyDictionary<string, int> index, string columnName)
    {
        var raw = GetValue(fields, index, columnName);
        if (DateTime.TryParseExact(raw, DateFormats, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed))
        {
            return parsed;
        }

        if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out parsed))
        {
            return parsed;
        }

        return DateTime.UtcNow;
    }

    private static bool ParseBool(string raw)
    {
        if (bool.TryParse(raw, out var boolValue))
        {
            return boolValue;
        }

        if (int.TryParse(raw, out var intValue))
        {
            return intValue != 0;
        }

        return string.Equals(raw, "yes", StringComparison.OrdinalIgnoreCase)
            || string.Equals(raw, "y", StringComparison.OrdinalIgnoreCase);
    }
}
