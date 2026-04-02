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

    private IEstimator<ITransformer> HashText(string outputCol, string inputCol, int numberOfBits = 14)
    {
        var norm = $"{outputCol}_norm";
        var tokens = $"{outputCol}_tokens";
        var keys = $"{outputCol}_keys";
        return _mlContext.Transforms.Text.NormalizeText(norm, inputCol)
            .Append(_mlContext.Transforms.Text.TokenizeIntoWords(tokens, norm))
            .Append(_mlContext.Transforms.Conversion.MapValueToKey(keys, tokens))
            .Append(_mlContext.Transforms.Text.ProduceHashedNgrams(outputCol, keys, numberOfBits: numberOfBits));
    }

    public IncidentPredictionTrainingResult TrainAndSave(string csvPath, string modelPath, string labelColumnName)
    {
        var rows = _reader.Read(csvPath, labelColumnName);
        var data = _mlContext.Data.LoadFromEnumerable(rows);
        var split = _mlContext.Data.TrainTestSplit(data, testFraction: 0.2);

        var pipeline = HashText("TitleFeatures", nameof(IncidentPredictionRequestDto.Title))
            .Append(HashText("DescriptionFeatures", nameof(IncidentPredictionRequestDto.Description)))
            .Append(HashText("LocationFeatures", nameof(IncidentPredictionRequestDto.Location)))
            .Append(HashText("DetectedObjectsFeatures", nameof(IncidentPredictionRequestDto.DetectedObjects)))
            .Append(HashText("CrimeCategoryFeatures", nameof(IncidentPredictionRequestDto.CrimeCategory)))
            .Append(_mlContext.Transforms.Conversion.ConvertType("AnonymousValue", nameof(IncidentTrainingRecord.Anonymous), DataKind.Single))
            .Append(_mlContext.Transforms.Conversion.ConvertType("HasAudioValue", nameof(IncidentTrainingRecord.HasAudio), DataKind.Single))
            .Append(_mlContext.Transforms.Conversion.ConvertType("HasImageValue", nameof(IncidentTrainingRecord.HasImage), DataKind.Single))
            .Append(_mlContext.Transforms.Concatenate(
                "Features",
                "TitleFeatures",
                "DescriptionFeatures",
                "LocationFeatures",
                "DetectedObjectsFeatures",
                "CrimeCategoryFeatures",
                "AnonymousValue",
                "HasAudioValue",
                "HasImageValue",
                nameof(IncidentTrainingRecord.OccurredHour),
                nameof(IncidentTrainingRecord.DayOfWeek),
                nameof(IncidentTrainingRecord.IsWeekend),
                nameof(IncidentTrainingRecord.IsNighttime),
                nameof(IncidentTrainingRecord.ReportDelayHours)))
            .Append(_mlContext.BinaryClassification.Trainers.LightGbm(
                labelColumnName: nameof(IncidentTrainingRecord.Label),
                featureColumnName: "Features",
                numberOfLeaves: 31,
                numberOfIterations: 100,
                minimumExampleCountPerLeaf: 10,
                learningRate: 0.1));

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
