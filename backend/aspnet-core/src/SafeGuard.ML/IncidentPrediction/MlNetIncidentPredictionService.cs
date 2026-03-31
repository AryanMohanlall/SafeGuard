using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.ML;
using SafeGuard.Services.IncidentPredictionService;
using SafeGuard.Services.IncidentPredictionService.Dto;

namespace SafeGuard.ML.IncidentPrediction;

public class MlNetIncidentPredictionService : IIncidentPredictionService
{
    private readonly IncidentPredictionModelConfiguration _configuration;
    private readonly MLContext _mlContext;
    private ITransformer _model;

    public MlNetIncidentPredictionService(IncidentPredictionModelConfiguration configuration)
    {
        _configuration = configuration;
        _mlContext = new MLContext(seed: 1);
    }

    public Task<IncidentPredictionResultDto> PredictAsync(IncidentPredictionRequestDto input)
    {
        EnsureModelLoaded();

        var modelInput = new IncidentPredictionModelInput
        {
            Title = input.Title ?? string.Empty,
            Description = input.Description ?? string.Empty,
            Location = input.Location ?? string.Empty,
            DetectedObjects = input.DetectedObjects ?? string.Empty,
            Anonymous = input.Anonymous,
            HasAudio = input.HasAudio,
            HasImage = input.HasImage,
            OccurredHour = input.OccurredAt.Hour,
            ReportDelayHours = (float)Math.Max(0, (input.ReportedAt - input.OccurredAt).TotalHours)
        };

        var predictionEngine = _mlContext.Model.CreatePredictionEngine<IncidentPredictionModelInput, IncidentPredictionModelOutput>(_model);
        var prediction = predictionEngine.Predict(modelInput);

        return Task.FromResult(new IncidentPredictionResultDto
        {
            IsHighPriority = prediction.PredictedLabel,
            Probability = prediction.Probability,
            Score = prediction.Score
        });
    }

    private void EnsureModelLoaded()
    {
        if (_model != null)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(_configuration.ModelPath))
        {
            throw new InvalidOperationException("ML model path is not configured.");
        }

        if (!File.Exists(_configuration.ModelPath))
        {
            throw new FileNotFoundException(
                $"ML model file was not found at '{_configuration.ModelPath}'. Train the model before requesting predictions.");
        }

        _model = _mlContext.Model.Load(_configuration.ModelPath, out _);
    }
}
