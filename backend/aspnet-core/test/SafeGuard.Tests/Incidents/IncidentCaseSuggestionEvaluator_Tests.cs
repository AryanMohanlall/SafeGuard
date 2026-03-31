using System;
using System.Collections.Generic;
using SafeGuard.Services.IncidentClusteringService;
using SafeGuard.Services.IncidentClusteringService.Dto;
using Shouldly;
using Xunit;

namespace SafeGuard.Tests.Incidents;

public class IncidentCaseSuggestionEvaluator_Tests
{
    private readonly IncidentCaseSuggestionEvaluator _evaluator = new(new IncidentCaseSuggestionOptions
    {
        MinimumIncidentCount = 2,
        MaximumTimeSpanHours = 72,
        MaximumClusterRadiusKm = 20,
        MinimumConfidenceScore = 0.5
    });

    [Fact]
    public void Evaluate_ShouldReturnSuggestion_ForTightSimilarCluster()
    {
        var incidents = new List<IncidentClusteringCandidateDto>
        {
            BuildIncident("House break-in on Adderley Street", "Adderley Street, Cape Town CBD", -33.930055m, 18.409740m, "[\"person\",\"bag\"]", 0),
            BuildIncident("House break-in on Long Street", "Long Street, Cape Town CBD", -33.924870m, 18.417350m, "[\"person\",\"bag\"]", 5),
            BuildIncident("Burglary reported near Bree Street", "Bree Street, Cape Town CBD", -33.920450m, 18.414000m, "[\"person\",\"bag\"]", 18),
        };

        var suggestion = _evaluator.Evaluate(2, incidents);

        suggestion.ShouldNotBeNull();
        suggestion.ClusterId.ShouldBe(2);
        suggestion.IncidentIds.Count.ShouldBe(3);
        suggestion.DominantCategory.ShouldBe("property burglary");
        suggestion.ConfidenceScore.ShouldBeGreaterThan(0.5f);
    }

    [Fact]
    public void Evaluate_ShouldReturnNull_WhenAllIncidentsAlreadyShareOneCase()
    {
        var caseId = Guid.NewGuid();
        var incidents = new List<IncidentClusteringCandidateDto>
        {
            BuildIncident("Robbery on Main Road", "Main Road, Johannesburg CBD", -26.204100m, 28.047300m, "[\"person\"]", 0, caseId),
            BuildIncident("Robbery on Commissioner Street", "Commissioner Street, Johannesburg CBD", -26.207000m, 28.046000m, "[\"person\"]", 6, caseId),
        };

        var suggestion = _evaluator.Evaluate(4, incidents);

        suggestion.ShouldBeNull();
    }

    private static IncidentClusteringCandidateDto BuildIncident(
        string title,
        string location,
        decimal latitude,
        decimal longitude,
        string detectedObjects,
        int hourOffset,
        Guid? caseId = null)
    {
        var occurredAt = new DateTime(2026, 3, 20, 8, 0, 0, DateTimeKind.Utc).AddHours(hourOffset);

        return new IncidentClusteringCandidateDto
        {
            IncidentId = Guid.NewGuid(),
            CaseId = caseId,
            Title = title,
            Location = location,
            DetectedObjects = detectedObjects,
            Latitude = latitude,
            Longitude = longitude,
            OccurredAt = occurredAt,
            ReportedAt = occurredAt.AddHours(1)
        };
    }
}
