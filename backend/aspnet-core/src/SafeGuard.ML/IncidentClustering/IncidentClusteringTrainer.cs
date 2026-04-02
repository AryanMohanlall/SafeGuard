using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.ML;
using Microsoft.ML.Data;
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

    // ── Hashed n-gram text featuriser (fixed-length, avoids VarVector error) ──

    private IEstimator<ITransformer> HashText(string outputCol, string inputCol, int numberOfBits = 14)
    {
        var norm   = $"{outputCol}_norm";
        var tokens = $"{outputCol}_tokens";
        var keys   = $"{outputCol}_keys";

        return _mlContext.Transforms.Text.NormalizeText(norm, inputCol)
            .Append(_mlContext.Transforms.Text.TokenizeIntoWords(tokens, norm))
            .Append(_mlContext.Transforms.Conversion.MapValueToKey(keys, tokens))
            .Append(_mlContext.Transforms.Text.ProduceHashedNgrams(outputCol, keys,
                numberOfBits: numberOfBits,
                ngramLength: 2,
                useAllLengths: true));
    }

    // ── Main train method ─────────────────────────────────────────────────────

    public IncidentClusteringTrainingResultDto TrainAndSave(
        string csvPath, string modelPath, int clusterCount)
    {
        var incidents = _reader.Read(csvPath);

        if (incidents.Count == 0)
            throw new InvalidOperationException("No incidents found in CSV.");

        // Auto-select cluster count if caller passes 0 or less
        // Rule of thumb: sqrt(n/2) capped between 5 and 30
        if (clusterCount <= 0)
            clusterCount = Math.Clamp((int)Math.Sqrt(incidents.Count / 2.0), 5, 30);

        var rows = incidents.Select(_reader.MapToModelInput).ToList();
        var data = _mlContext.Data.LoadFromEnumerable(rows);

        var pipeline = BuildPipeline(clusterCount);
        var model    = pipeline.Fit(data);

        // ── Evaluate cluster quality ──────────────────────────────────────────
        var predictions  = model.Transform(data);
        var clusterSizes = GetClusterSizes(predictions, clusterCount);
        var avgDistance  = GetAverageDistance(predictions);

        // ── Persist model ─────────────────────────────────────────────────────
        var directory = Path.GetDirectoryName(modelPath);
        if (!string.IsNullOrWhiteSpace(directory))
            Directory.CreateDirectory(directory);

        _mlContext.Model.Save(model, data.Schema, modelPath);

        return new IncidentClusteringTrainingResultDto
        {
            RecordsRead       = incidents.Count,
            ClusterCount      = clusterCount,
            ClusterSizes      = clusterSizes,
            AverageDistance   = avgDistance,
            CsvPath           = csvPath,
            ModelPath         = modelPath,
        };
    }

    // ── Pipeline definition ───────────────────────────────────────────────────

    private IEstimator<ITransformer> BuildPipeline(int clusterCount)
    {
        // Text features — hashed n-grams produce fixed-length vectors
        // Title gets more bits (more signal), detected objects fewer (short strings)
        var textPipeline =
            HashText("TitleFeatures",           nameof(IncidentClusteringModelInput.TitleText),          numberOfBits: 14)
            .Append(HashText("CategoryFeatures",     nameof(IncidentClusteringModelInput.CategoryText),      numberOfBits: 12))
            .Append(HashText("LocationFeatures",     nameof(IncidentClusteringModelInput.LocationText),      numberOfBits: 12))
            .Append(HashText("ObjectFeatures",       nameof(IncidentClusteringModelInput.DetectedObjectsText),numberOfBits: 10));

        // Geographic features — normalised separately so lat/lng aren't
        // distorted by binary flags like IsWeekend
        var geoPipeline =
            _mlContext.Transforms.Concatenate(
                "GeoRaw",
                nameof(IncidentClusteringModelInput.Latitude),
                nameof(IncidentClusteringModelInput.Longitude))
            .Append(_mlContext.Transforms.NormalizeMinMax("GeoFeatures", "GeoRaw"));

        // Temporal + structural flags — normalised together
        var temporalPipeline =
            _mlContext.Transforms.Concatenate(
                "TemporalRaw",
                nameof(IncidentClusteringModelInput.HourOfDay),
                nameof(IncidentClusteringModelInput.DayOfWeek),
                nameof(IncidentClusteringModelInput.IsWeekend),
                nameof(IncidentClusteringModelInput.HasCoordinates))
            .Append(_mlContext.Transforms.NormalizeMinMax("TemporalFeatures", "TemporalRaw"));

        // Combine all features — weight geo and text higher than temporal
        // by repeating geo features (simple weighting trick in ML.NET)
        var combinePipeline =
            _mlContext.Transforms.Concatenate(
                "Features",
                "TitleFeatures",
                "CategoryFeatures",
                "LocationFeatures",
                "ObjectFeatures",
                "GeoFeatures",
                "GeoFeatures",      // geo weighted 2x — location matters for clustering
                "TemporalFeatures");

        return textPipeline
            .Append(geoPipeline)
            .Append(temporalPipeline)
            .Append(combinePipeline)
            .Append(_mlContext.Clustering.Trainers.KMeans(
                featureColumnName: "Features",
                numberOfClusters: clusterCount));
    }

    // ── Evaluation helpers ────────────────────────────────────────────────────

    private Dictionary<uint, int> GetClusterSizes(IDataView predictions, int clusterCount)
    {
        var sizes = new Dictionary<uint, int>();
        for (uint i = 1; i <= clusterCount; i++) sizes[i] = 0;

        var labelCol = predictions.GetColumn<uint>(predictions.Schema["PredictedLabel"]);
        foreach (var label in labelCol)
        {
            if (sizes.ContainsKey(label))
                sizes[label]++;
        }

        return sizes;
    }

    private float GetAverageDistance(IDataView predictions)
    {
        try
        {
            var scoreCol = predictions.Schema["Score"];
            var scores   = predictions.GetColumn<float[]>(scoreCol);
            var total    = 0f;
            var count    = 0;

            foreach (var score in scores)
            {
                if (score != null && score.Length > 0)
                {
                    total += score.Min(); // distance to nearest centroid
                    count++;
                }
            }

            return count > 0 ? total / count : 0f;
        }
        catch
        {
            return 0f;
        }
    }
}