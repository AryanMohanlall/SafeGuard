using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace SafeGuard.Services.IncidentClusteringService;

public static class IncidentFeatureTextNormalizer
{
    private static readonly IReadOnlyDictionary<string, string> CategoryKeywords =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["murder"] = "violent_homicide",
            ["homicide"] = "violent_homicide",
            ["assault"] = "violent_assault",
            ["robbery"] = "property_robbery",
            ["theft"] = "property_theft",
            ["steal"] = "property_theft",
            ["break-in"] = "property_burglary",
            ["burglary"] = "property_burglary",
            ["fraud"] = "financial_fraud",
            ["stock theft"] = "rural_stock_theft",
            ["vehicle"] = "vehicle_crime",
            ["car"] = "vehicle_crime",
            ["truck"] = "vehicle_crime",
            ["gun"] = "weapons",
            ["drug"] = "drug_offence",
            ["vandal"] = "vandalism",
            ["arson"] = "arson"
        };

    public static string NormalizeLocation(string location)
    {
        return NormalizeTokens(location);
    }

    public static string DeriveCategory(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return "uncategorized";
        }

        foreach (var pair in CategoryKeywords)
        {
            if (title.Contains(pair.Key, StringComparison.OrdinalIgnoreCase))
            {
                return pair.Value;
            }
        }

        return "uncategorized";
    }

    public static IReadOnlyList<string> ParseDetectedObjects(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return Array.Empty<string>();
        }

        try
        {
            using var document = JsonDocument.Parse(raw);
            if (document.RootElement.ValueKind == JsonValueKind.Array)
            {
                return document.RootElement
                    .EnumerateArray()
                    .Select(ReadObjectToken)
                    .Where(token => !string.IsNullOrWhiteSpace(token))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();
            }
        }
        catch (JsonException)
        {
        }

        return raw
            .Replace("[", " ", StringComparison.Ordinal)
            .Replace("]", " ", StringComparison.Ordinal)
            .Split([',', ';', '|'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(value => value.Trim().Trim('"', '\''))
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static string NormalizeDetectedObjects(string raw)
    {
        return string.Join(' ', ParseDetectedObjects(raw));
    }

    public static string BuildLocationAnchor(string location)
    {
        var normalized = NormalizeLocation(location);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return "unknown area";
        }

        return normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Take(3)
            .DefaultIfEmpty("unknown")
            .Aggregate((left, right) => $"{left} {right}");
    }

    private static string NormalizeTokens(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var builder = new StringBuilder(input.Length);
        foreach (var character in input.ToLowerInvariant())
        {
            builder.Append(char.IsLetterOrDigit(character) ? character : ' ');
        }

        return string.Join(' ',
            builder.ToString()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Distinct(StringComparer.OrdinalIgnoreCase));
    }

    private static string ReadObjectToken(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Object when element.TryGetProperty("name", out var nameProperty) => nameProperty.GetString(),
            _ => null
        };
    }
}
