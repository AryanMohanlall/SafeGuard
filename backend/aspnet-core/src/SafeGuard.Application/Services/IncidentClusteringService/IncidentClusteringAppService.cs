using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using SafeGuard.Domains.Case;
using SafeGuard.Domains.Incidents;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.Services.IncidentClusteringService;

[AbpAuthorize]
public class IncidentClusteringAppService : SafeGuardAppServiceBase, IIncidentClusteringAppService
{
    private readonly IRepository<Incident, Guid> _incidentRepository;
    private readonly IRepository<Case, Guid> _caseRepository;
    private readonly IIncidentClusteringService _incidentClusteringService;
    private readonly IncidentCaseSuggestionEvaluator _suggestionEvaluator;

    public IncidentClusteringAppService(
        IRepository<Incident, Guid> incidentRepository,
        IRepository<Case, Guid> caseRepository,
        IIncidentClusteringService incidentClusteringService,
        IncidentCaseSuggestionOptions options)
    {
        _incidentRepository = incidentRepository;
        _caseRepository = caseRepository;
        _incidentClusteringService = incidentClusteringService;
        _suggestionEvaluator = new IncidentCaseSuggestionEvaluator(options);
    }

    public Task<IncidentClusteringTrainingResultDto> RegenerateModelAsync(RegenerateIncidentClusteringInputDto input)
    {
        return _incidentClusteringService.TrainModelAsync(new IncidentClusteringTrainingRequestDto
        {
            CsvPath = input?.CsvPath,
            ModelPath = input?.ModelPath,
            ClusterCount = input?.ClusterCount
        });
    }

    public async Task<SuggestedIncidentCaseGraphDto> GetSuggestedCaseGraphAsync(GetSuggestedCaseGraphInputDto input)
    {
        if (input?.RetrainModel == true)
        {
            await RegenerateModelAsync(new RegenerateIncidentClusteringInputDto
            {
                CsvPath = input.CsvPath,
                ModelPath = input.ModelPath,
                ClusterCount = input.ClusterCount
            });
        }

        IQueryable<Incident> query = _incidentRepository.GetAll()
            .OrderByDescending(incident => incident.ReportedAt);

        if (input?.MaxIncidentCount is > 0)
        {
            query = query.Take(input.MaxIncidentCount.Value);
        }

        var incidents = await query.ToListAsync();
        if (incidents.Count == 0)
        {
            return new SuggestedIncidentCaseGraphDto
            {
                GeneratedAt = DateTime.UtcNow
            };
        }

        var candidates = incidents
            .Select(MapCandidate)
            .ToList();

        var assignments = await _incidentClusteringService.AssignClustersAsync(candidates);
        var clusterLookup = assignments
            .GroupBy(assignment => assignment.ClusterId)
            .ToDictionary(
                group => group.Key,
                group => group.Select(assignment => candidates.First(candidate => candidate.IncidentId == assignment.IncidentId)).ToList());

        var requiredCaseIds = incidents
            .Where(incident => incident.CaseId.HasValue)
            .Select(incident => incident.CaseId.Value)
            .Distinct()
            .ToList();

        var caseLookup = await _caseRepository.GetAll()
            .Where(caseItem => requiredCaseIds.Contains(caseItem.Id))
            .ToDictionaryAsync(caseItem => caseItem.Id);

        var nodes = new List<IncidentGraphNodeDto>();
        var edges = new List<IncidentGraphEdgeDto>();
        var suggestions = new List<SuggestedIncidentCaseDto>();

        foreach (var clusterEntry in clusterLookup.OrderBy(entry => entry.Key))
        {
            var suggestion = _suggestionEvaluator.Evaluate(clusterEntry.Key, clusterEntry.Value);
            if (suggestion != null)
            {
                suggestions.Add(suggestion);
            }

            AddClusterGraph(clusterEntry.Key, clusterEntry.Value, suggestion, caseLookup, nodes, edges);
        }

        return new SuggestedIncidentCaseGraphDto
        {
            GeneratedAt = DateTime.UtcNow,
            IncidentCount = candidates.Count,
            ClusterCount = clusterLookup.Count,
            SuggestionCount = suggestions.Count,
            Nodes = nodes,
            Edges = edges,
            Suggestions = suggestions.OrderByDescending(suggestion => suggestion.ConfidenceScore).ToList()
        };
    }

    private void AddClusterGraph(
        int clusterId,
        IReadOnlyList<IncidentClusteringCandidateDto> incidents,
        SuggestedIncidentCaseDto suggestion,
        IReadOnlyDictionary<Guid, Case> caseLookup,
        ICollection<IncidentGraphNodeDto> nodes,
        ICollection<IncidentGraphEdgeDto> edges)
    {
        var groupId = suggestion?.GroupId ?? $"cluster-{clusterId}";
        var clusterNodeId = $"cluster-node-{clusterId}";
        var suggestionNodeId = $"suggestion-node-{clusterId}";
        var dominantCategory = incidents
            .Select(incident => IncidentFeatureTextNormalizer.DeriveCategory(incident.Title))
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .GroupBy(value => value, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key)
            .Select(group => group.Key)
            .FirstOrDefault() ?? "uncategorized";
        var dominantObject = incidents
            .SelectMany(incident => IncidentFeatureTextNormalizer.ParseDetectedObjects(incident.DetectedObjects))
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .GroupBy(value => value, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(group => group.Count())
            .ThenBy(group => group.Key)
            .Select(group => group.Key)
            .FirstOrDefault() ?? "mixed objects";
        var narrative = IncidentClusterNarrativeBuilder.Build(incidents, dominantCategory, dominantObject);

        nodes.Add(new IncidentGraphNodeDto
        {
            Id = clusterNodeId,
            Label = narrative.ClusterLabel,
            Subtitle = suggestion == null
                ? $"{incidents.Count} incidents - {narrative.ClusterSubtitle} - no case suggestion yet"
                : $"{incidents.Count} incidents - {narrative.ClusterSubtitle}",
            Type = "cluster",
            GroupId = groupId,
            ClusterId = clusterId,
            ConfidenceScore = suggestion?.ConfidenceScore,
            Status = "clustered"
        });

        if (suggestion != null)
        {
            nodes.Add(new IncidentGraphNodeDto
            {
                Id = suggestionNodeId,
                Label = suggestion.SuggestedTitle,
                Subtitle = $"Confidence {Math.Round(suggestion.ConfidenceScore * 100)}%",
                Type = "suggestion",
                GroupId = groupId,
                ClusterId = clusterId,
                SuggestionId = suggestion.Id,
                ConfidenceScore = suggestion.ConfidenceScore,
                Status = "review"
            });

            edges.Add(new IncidentGraphEdgeDto
            {
                Id = $"edge-{clusterNodeId}-{suggestionNodeId}",
                Source = clusterNodeId,
                Target = suggestionNodeId,
                Type = "cluster-suggestion",
                Label = "suggested grouping",
                Weight = suggestion.ConfidenceScore,
                GroupId = groupId
            });
        }

        foreach (var incident in incidents.OrderBy(incident => incident.OccurredAt))
        {
            var incidentNodeId = $"incident-node-{incident.IncidentId}";
            nodes.Add(new IncidentGraphNodeDto
            {
                Id = incidentNodeId,
                Label = incident.Title,
                Subtitle = incident.Location,
                Type = "incident",
                GroupId = groupId,
                ClusterId = clusterId,
                SuggestionId = suggestion?.Id,
                IncidentId = incident.IncidentId,
                CaseId = incident.CaseId,
                Latitude = incident.Latitude,
                Longitude = incident.Longitude,
                Status = incident.CaseId.HasValue ? "linked" : "unlinked"
            });

            edges.Add(new IncidentGraphEdgeDto
            {
                Id = $"edge-{clusterNodeId}-{incidentNodeId}",
                Source = clusterNodeId,
                Target = incidentNodeId,
                Type = "cluster-incident",
                Label = "same ML cluster",
                Weight = 1f,
                GroupId = groupId
            });

            if (suggestion != null)
            {
                edges.Add(new IncidentGraphEdgeDto
                {
                    Id = $"edge-{suggestionNodeId}-{incidentNodeId}",
                    Source = suggestionNodeId,
                    Target = incidentNodeId,
                    Type = "suggestion-incident",
                    Label = "review together",
                    Weight = suggestion.ConfidenceScore,
                    GroupId = groupId
                });
            }

            if (!incident.CaseId.HasValue || !caseLookup.TryGetValue(incident.CaseId.Value, out var caseItem))
            {
                continue;
            }

            var caseNodeId = $"case-node-{caseItem.Id}";
            if (nodes.All(node => node.Id != caseNodeId))
            {
                nodes.Add(new IncidentGraphNodeDto
                {
                    Id = caseNodeId,
                    Label = caseItem.CaseNumber,
                    Subtitle = caseItem.Title,
                    Type = "case",
                    GroupId = groupId,
                    ClusterId = clusterId,
                    CaseId = caseItem.Id,
                    Status = caseItem.Status
                });
            }

            edges.Add(new IncidentGraphEdgeDto
            {
                Id = $"edge-{caseNodeId}-{incidentNodeId}",
                Source = caseNodeId,
                Target = incidentNodeId,
                Type = "case-incident",
                Label = "currently linked",
                Weight = 1f,
                GroupId = groupId
            });
        }
    }

    private static IncidentClusteringCandidateDto MapCandidate(Incident incident)
    {
        return new IncidentClusteringCandidateDto
        {
            IncidentId = incident.Id,
            CaseId = incident.CaseId,
            Title = incident.Title ?? string.Empty,
            Location = incident.Location ?? string.Empty,
            DetectedObjects = incident.DetectedObjects ?? string.Empty,
            Latitude = incident.Latitude,
            Longitude = incident.Longitude,
            OccurredAt = incident.OccurredAt,
            ReportedAt = incident.ReportedAt
        };
    }
}
