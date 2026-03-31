using System;
using System.IO;
using Microsoft.ML;
using Microsoft.ML.Data;
using SafeGuard.Services.IncidentPredictionService.Dto;

namespace SafeGuard.ML.IncidentPrediction;

public class IncidentPredictionTrainer
{
    private readonly MLContext _mlContext;
    private readonly CsvIncidentTrainingReader _reader;

    public IncidentPredictionTrainer()
    {
        _mlContext = new MLContext(seed: 1);
        _reader = new CsvIncidentTrainingReader();
    }

    public IncidentPredictionTrainingResult TrainAndSave(string csvPath, string modelPath, string labelColumnName)
    {
        var rows = _reader.Read(csvPath, labelColumnName);
        var data = _mlContext.Data.LoadFromEnumerable(rows);
        var split = _mlContext.Data.TrainTestSplit(data, testFraction: 0.2);

        var pipeline = _mlContext.Transforms.Text.FeaturizeText("TitleFeatures", nameof(IncidentPredictionRequestDto.Title))
            .Append(_mlContext.Transforms.Text.FeaturizeText("DescriptionFeatures", nameof(IncidentPredictionRequestDto.Description)))
            .Append(_mlContext.Transforms.Text.FeaturizeText("LocationFeatures", nameof(IncidentPredictionRequestDto.Location)))
            .Append(_mlContext.Transforms.Text.FeaturizeText("DetectedObjectsFeatures", nameof(IncidentPredictionRequestDto.DetectedObjects)))
            .Append(_mlContext.Transforms.Conversion.ConvertType("AnonymousValue", nameof(IncidentTrainingRecord.Anonymous), DataKind.Single))
            .Append(_mlContext.Transforms.Conversion.ConvertType("HasAudioValue", nameof(IncidentTrainingRecord.HasAudio), DataKind.Single))
            .Append(_mlContext.Transforms.Conversion.ConvertType("HasImageValue", nameof(IncidentTrainingRecord.HasImage), DataKind.Single))
            .Append(_mlContext.Transforms.Concatenate(
                "Features",
                "TitleFeatures",
                "DescriptionFeatures",
                "LocationFeatures",
                "DetectedObjectsFeatures",
                "AnonymousValue",
                "HasAudioValue",
                "HasImageValue",
                nameof(IncidentTrainingRecord.OccurredHour),
                nameof(IncidentTrainingRecord.ReportDelayHours)))
            .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(
                labelColumnName: nameof(IncidentTrainingRecord.Label),
                featureColumnName: "Features"));

        var model = pipeline.Fit(split.TrainSet);
        var predictions = model.Transform(split.TestSet);
        var metrics = _mlContext.BinaryClassification.Evaluate(
            predictions,
            labelColumnName: nameof(IncidentTrainingRecord.Label));

        var directory = Path.GetDirectoryName(modelPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        _mlContext.Model.Save(model, data.Schema, modelPath);

        return new IncidentPredictionTrainingResult
        {
            RecordsRead = rows.Count,
            Accuracy = metrics.Accuracy,
            AreaUnderRocCurve = metrics.AreaUnderRocCurve,
            PositivePrecision = metrics.PositivePrecision,
            PositiveRecall = metrics.PositiveRecall,
            ModelPath = modelPath
        };
    }
}
