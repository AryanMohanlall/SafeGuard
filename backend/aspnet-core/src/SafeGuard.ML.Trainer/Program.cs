using System;
using System.IO;
using SafeGuard.ML.IncidentPrediction;
using SafeGuard.ML.Trainer.TrainingData;

var solutionRoot = ResolveSolutionRoot(Directory.GetCurrentDirectory());
var command = args.Length > 0 ? args[0].ToLowerInvariant() : "train";

switch (command)
{
    case "generate":
        RunGenerate(args, solutionRoot);
        break;
    case "train":
        RunTrain(args, solutionRoot);
        break;
    default:
        ShowUsage();
        break;
}

static void RunGenerate(string[] args, string solutionRoot)
{
    var outputPath = args.Length > 1
        ? args[1]
        : Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            "Downloads",
            "incident-training-data.csv");

    var count = args.Length > 2 && int.TryParse(args[2], out var parsedCount)
        ? parsedCount
        : 1000;

    if (count <= 0)
    {
        throw new ArgumentOutOfRangeException(nameof(args), "Row count must be greater than zero.");
    }

    if (!Path.IsPathRooted(outputPath))
    {
        outputPath = Path.Combine(solutionRoot, outputPath);
    }

    Console.WriteLine($"Generating {count} incident training rows into '{outputPath}'");

    var generator = new BogusIncidentTrainingDataGenerator();
    var writer = new IncidentTrainingCsvWriter();
    var rows = generator.Generate(count);
    writer.Write(outputPath, rows);

    Console.WriteLine("Generation complete.");
    Console.WriteLine("CSV includes a 'label' column for ML.NET training.");
}

static void RunTrain(string[] args, string solutionRoot)
{
    var csvPath = args.Length > 1
        ? args[1]
        : Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            "Downloads",
            "MOCK_DATA.csv");

    var modelPath = args.Length > 2
        ? args[2]
        : Path.Combine(
            solutionRoot,
            "src",
            "SafeGuard.Web.Host",
            "App_Data",
            "ML",
            "incident-prediction-model.zip");

    var labelColumnName = args.Length > 3 ? args[3] : "label";

    if (!Path.IsPathRooted(csvPath))
    {
        csvPath = Path.Combine(solutionRoot, csvPath);
    }

    if (!Path.IsPathRooted(modelPath))
    {
        modelPath = Path.Combine(solutionRoot, modelPath);
    }

    Console.WriteLine($"Training incident prediction model from '{csvPath}'");
    Console.WriteLine($"Saving trained model to '{modelPath}'");
    Console.WriteLine($"Using label column '{labelColumnName}'");

    var trainer = new IncidentPredictionTrainer();
    var result = trainer.TrainAndSave(csvPath, modelPath, labelColumnName);

    Console.WriteLine("Training complete.");
    Console.WriteLine($"Records read: {result.RecordsRead}");
    Console.WriteLine($"Accuracy: {result.Accuracy:P2}");
    Console.WriteLine($"AUC: {result.AreaUnderRocCurve:P2}");
    Console.WriteLine($"Positive precision: {result.PositivePrecision:P2}");
    Console.WriteLine($"Positive recall: {result.PositiveRecall:P2}");
}

static void ShowUsage()
{
    Console.WriteLine("Usage:");
    Console.WriteLine("  generate [outputCsvPath] [rowCount]");
    Console.WriteLine("  train [inputCsvPath] [outputModelPath] [labelColumnName]");
}

static string ResolveSolutionRoot(string startDirectory)
{
    var current = new DirectoryInfo(startDirectory);
    while (current != null)
    {
        var candidate = Path.Combine(current.FullName, "SafeGuard.sln");
        if (File.Exists(candidate))
        {
            return current.FullName;
        }

        var nestedCandidate = Path.Combine(current.FullName, "backend", "aspnet-core", "SafeGuard.sln");
        if (File.Exists(nestedCandidate))
        {
            return Path.GetDirectoryName(nestedCandidate) ?? current.FullName;
        }

        current = current.Parent;
    }

    return startDirectory;
}
