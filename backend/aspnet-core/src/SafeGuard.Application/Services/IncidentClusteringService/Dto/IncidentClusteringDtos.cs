using System;
using System.Collections.Generic;

namespace SafeGuard.Services.IncidentClusteringService.Dto;

public class IncidentClusteringCandidateDto
{
    public Guid IncidentId { get; set; }

    public Guid? CaseId { get; set; }

    public string Title { get; set; }

    public string Location { get; set; }

    public string DetectedObjects { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public DateTime OccurredAt { get; set; }

    public DateTime ReportedAt { get; set; }
}

public class IncidentClusterAssignmentDto
{
    public Guid IncidentId { get; set; }

    public int ClusterId { get; set; }

    public float DistanceToCentroid { get; set; }

    public IReadOnlyList<float> Distances { get; set; } = Array.Empty<float>();
}

public class IncidentClusteringTrainingRequestDto
{
    public string CsvPath { get; set; }

    public string ModelPath { get; set; }

    public int? ClusterCount { get; set; }
}

public class IncidentClusteringTrainingResultDto
{
    public int RecordsRead { get; set; }

    public int ClusterCount { get; set; }

    public string CsvPath { get; set; }

    public string ModelPath { get; set; }
}

public class RegenerateIncidentClusteringInputDto
{
    public string CsvPath { get; set; }

    public string ModelPath { get; set; }

    public int? ClusterCount { get; set; }
}

public class GetSuggestedCaseGraphInputDto
{
    public bool RetrainModel { get; set; }

    public string CsvPath { get; set; }

    public string ModelPath { get; set; }

    public int? ClusterCount { get; set; }

    public int? MaxIncidentCount { get; set; }
}

public class SuggestedIncidentCaseGraphDto
{
    public DateTime GeneratedAt { get; set; }

    public int IncidentCount { get; set; }

    public int ClusterCount { get; set; }

    public int SuggestionCount { get; set; }

    public IReadOnlyList<IncidentGraphNodeDto> Nodes { get; set; } = Array.Empty<IncidentGraphNodeDto>();

    public IReadOnlyList<IncidentGraphEdgeDto> Edges { get; set; } = Array.Empty<IncidentGraphEdgeDto>();

    public IReadOnlyList<SuggestedIncidentCaseDto> Suggestions { get; set; } = Array.Empty<SuggestedIncidentCaseDto>();
}

public class IncidentGraphNodeDto
{
    public string Id { get; set; }

    public string Label { get; set; }

    public string Subtitle { get; set; }

    public string Type { get; set; }

    public string GroupId { get; set; }

    public int? ClusterId { get; set; }

    public string SuggestionId { get; set; }

    public Guid? IncidentId { get; set; }

    public Guid? CaseId { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public float? ConfidenceScore { get; set; }

    public string Status { get; set; }
}

public class IncidentGraphEdgeDto
{
    public string Id { get; set; }

    public string Source { get; set; }

    public string Target { get; set; }

    public string Type { get; set; }

    public string Label { get; set; }

    public float Weight { get; set; }

    public string GroupId { get; set; }
}

public class SuggestedIncidentCaseDto
{
    public string Id { get; set; }

    public string GroupId { get; set; }

    public int ClusterId { get; set; }

    public string SuggestedTitle { get; set; }

    public string DominantCategory { get; set; }

    public string DominantObject { get; set; }

    public float ConfidenceScore { get; set; }

    public double TimeSpanHours { get; set; }

    public double MaxDistanceKm { get; set; }

    public IReadOnlyList<Guid> IncidentIds { get; set; } = Array.Empty<Guid>();

    public IReadOnlyList<Guid> ExistingCaseIds { get; set; } = Array.Empty<Guid>();

    public IReadOnlyList<string> Reasons { get; set; } = Array.Empty<string>();
}
