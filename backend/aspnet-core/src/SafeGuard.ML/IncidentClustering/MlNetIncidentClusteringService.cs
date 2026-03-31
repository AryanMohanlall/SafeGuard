using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.ML;
using SafeGuard.Services.IncidentClusteringService;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.ML.IncidentClustering;

public class MlNetIncidentClusteringService : IIncidentClusteringService
{
    private readonly IncidentClusteringModelConfiguration _configuration;
    private readonly MLContext _mlContext;
    private readonly CsvIncidentClusteringReader _reader;
    private ITransformer _model;

    public MlNetIncidentClusteringService(IncidentClusteringModelConfiguration configuration)
    {
        _configuration = configuration;
        _mlContext = new MLContext(seed: 1);
        _reader = new CsvIncidentClusteringReader();
    }

    public Task<IncidentClusteringTrainingResultDto> TrainModelAsync(IncidentClusteringTrainingRequestDto input)
    {
        var csvPath = ResolveTrainingCsvPath(input?.CsvPath);
        var modelPath = ResolveModelPath(input?.ModelPath);
        var clusterCount = input?.ClusterCount ?? _configuration.ClusterCount;

        var trainer = new IncidentClusteringTrainer();
        var result = trainer.TrainAndSave(csvPath, modelPath, clusterCount);
        _model = null;
        return Task.FromResult(result);
    }

    public Task<IReadOnlyList<IncidentClusterAssignmentDto>> AssignClustersAsync(IReadOnlyList<IncidentClusteringCandidateDto> incidents)
    {
        EnsureModelLoaded();

        var modelInputs = incidents.Select(_reader.MapToModelInput).ToList();
        var dataView = _mlContext.Data.LoadFromEnumerable(modelInputs);
        var transformed = _model.Transform(dataView);
        var predictions = _mlContext.Data.CreateEnumerable<IncidentClusteringModelOutput>(transformed, reuseRowObject: false)
            .ToList();

        if (predictions.Count != incidents.Count)
        {
            throw new InvalidOperationException("The clustering output row count did not match the input incidents.");
        }

        var results = incidents
            .Select((incident, index) =>
            {
                var prediction = predictions[index];
                var distances = prediction.Score ?? Array.Empty<float>();
                return new IncidentClusterAssignmentDto
                {
                    IncidentId = incident.IncidentId,
                    ClusterId = Math.Max(0, (int)prediction.PredictedLabel - 1),
                    DistanceToCentroid = distances.Length == 0 ? 0f : distances.Min(),
                    Distances = distances
                };
            })
            .ToList();

        return Task.FromResult<IReadOnlyList<IncidentClusterAssignmentDto>>(results);
    }

    private void EnsureModelLoaded()
    {
        if (_model != null)
        {
            return;
        }

        var modelPath = ResolveModelPath(null);
        if (!File.Exists(modelPath))
        {
            var defaultCsvPath = ResolveTrainingCsvPath(null);
            if (File.Exists(defaultCsvPath))
            {
                var trainer = new IncidentClusteringTrainer();
                trainer.TrainAndSave(defaultCsvPath, modelPath, _configuration.ClusterCount);
            }
        }

        if (!File.Exists(modelPath))
        {
            throw new FileNotFoundException(
                $"Incident clustering model was not found at '{modelPath}'. Regenerate the model first.");
        }

        _model = _mlContext.Model.Load(modelPath, out _);
    }

    private string ResolveModelPath(string requestedPath)
    {
        return string.IsNullOrWhiteSpace(requestedPath)
            ? _configuration.ModelPath
            : requestedPath;
    }

    private string ResolveTrainingCsvPath(string requestedPath)
    {
        if (!string.IsNullOrWhiteSpace(requestedPath))
        {
            return requestedPath;
        }

        if (!string.IsNullOrWhiteSpace(_configuration.DefaultTrainingCsvPath))
        {
            return _configuration.DefaultTrainingCsvPath;
        }

        return Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            "Downloads",
            "incident-training-data.csv");
    }
}
