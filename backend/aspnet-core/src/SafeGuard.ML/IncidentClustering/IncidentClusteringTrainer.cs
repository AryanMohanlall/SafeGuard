using System.IO;
using System.Linq;
using Microsoft.ML;
using SafeGuard.Services.IncidentClusteringService.Dto;

namespace SafeGuard.ML.IncidentClustering;

public class IncidentClusteringTrainer
{
    private readonly MLContext _mlContext;
    private readonly CsvIncidentClusteringReader _reader;

    public IncidentClusteringTrainer()
    {
        _mlContext = new MLContext(seed: 1);
        _reader = new CsvIncidentClusteringReader();
    }

    public IncidentClusteringTrainingResultDto TrainAndSave(string csvPath, string modelPath, int clusterCount)
    {
        var incidents = _reader.Read(csvPath);
        var rows = incidents.Select(_reader.MapToModelInput);
        var data = _mlContext.Data.LoadFromEnumerable(rows);

        var pipeline = _mlContext.Transforms.Text.FeaturizeText("TitleFeatures", nameof(IncidentClusteringModelInput.TitleText))
            .Append(_mlContext.Transforms.Text.FeaturizeText("CategoryFeatures", nameof(IncidentClusteringModelInput.CategoryText)))
            .Append(_mlContext.Transforms.Text.FeaturizeText("LocationFeatures", nameof(IncidentClusteringModelInput.LocationText)))
            .Append(_mlContext.Transforms.Text.FeaturizeText("DetectedObjectsFeatures", nameof(IncidentClusteringModelInput.DetectedObjectsText)))
            .Append(_mlContext.Transforms.Concatenate(
                "NumericFeatures",
                nameof(IncidentClusteringModelInput.Latitude),
                nameof(IncidentClusteringModelInput.Longitude),
                nameof(IncidentClusteringModelInput.HasCoordinates),
                nameof(IncidentClusteringModelInput.HourOfDay),
                nameof(IncidentClusteringModelInput.DayOfWeek),
                nameof(IncidentClusteringModelInput.IsWeekend)))
            .Append(_mlContext.Transforms.NormalizeMinMax("NumericFeatures"))
            .Append(_mlContext.Transforms.Concatenate(
                "Features",
                "TitleFeatures",
                "CategoryFeatures",
                "LocationFeatures",
                "DetectedObjectsFeatures",
                "NumericFeatures"))
            .Append(_mlContext.Clustering.Trainers.KMeans(
                featureColumnName: "Features",
                numberOfClusters: clusterCount));

        var model = pipeline.Fit(data);

        var directory = Path.GetDirectoryName(modelPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        _mlContext.Model.Save(model, data.Schema, modelPath);

        return new IncidentClusteringTrainingResultDto
        {
            RecordsRead = incidents.Count,
            ClusterCount = clusterCount,
            CsvPath = csvPath,
            ModelPath = modelPath
        };
    }
}
