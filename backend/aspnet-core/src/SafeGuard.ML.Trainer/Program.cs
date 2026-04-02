using System;
using System.IO;
using SafeGuard.ML.IncidentClustering;
using SafeGuard.ML.IncidentPrediction;
using SafeGuard.ML.Trainer.TrainingData;
using System.Linq;

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
    case "cluster-train":
        RunClusterTrain(args, solutionRoot);
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
            solutionRoot,
            "src",
            "SafeGuard.ML.Trainer",
            "TrainingData",
            "incident-training-data.csv");

    var count = args.Length > 2 && int.TryParse(args[2], out var parsedCount)
        ? parsedCount
        : 25000;

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
            solutionRoot,
            "src",
            "SafeGuard.ML.Trainer",
            "TrainingData",
            "incident-training-data.csv");

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

static void RunClusterTrain(string[] args, string solutionRoot)
{
    string csvPath;
    string modelPath;
    int clusterCount;

    if (args.Length > 1 && int.TryParse(args[1], out var simpleCount))
    {
        // Simple mode: dotnet run cluster-train 10
        csvPath      = Path.Combine(solutionRoot, "src", "SafeGuard.ML.Trainer", "TrainingData", "incident-training-data.csv");
        modelPath    = Path.Combine(solutionRoot, "src", "SafeGuard.Web.Host", "App_Data", "ML", "incident-clustering-model.zip");
        clusterCount = simpleCount;
    }
    else
    {
        // Full mode: dotnet run cluster-train csvPath modelPath clusterCount
        csvPath      = args.Length > 1 ? args[1] : Path.Combine(solutionRoot, "src", "SafeGuard.ML.Trainer", "TrainingData", "incident-training-data.csv");
        modelPath    = args.Length > 2 ? args[2] : Path.Combine(solutionRoot, "src", "SafeGuard.Web.Host", "App_Data", "ML", "incident-clustering-model.zip");
        clusterCount = args.Length > 3 && int.TryParse(args[3], out var parsedClusterCount) ? parsedClusterCount : 0;
    }

    if (!Path.IsPathRooted(csvPath))
        csvPath = Path.Combine(solutionRoot, csvPath);

    if (!Path.IsPathRooted(modelPath))
        modelPath = Path.Combine(solutionRoot, modelPath);

    Console.WriteLine($"Training incident clustering model from '{csvPath}'");
    Console.WriteLine($"Saving trained model to '{modelPath}'");
    Console.WriteLine(clusterCount > 0
        ? $"Using {clusterCount} clusters"
        : "Using auto cluster count (sqrt(n/2), capped 5–30)");

    var trainer = new IncidentClusteringTrainer();
    var result  = trainer.TrainAndSave(csvPath, modelPath, clusterCount);

    Console.WriteLine();
    Console.WriteLine("Clustering training complete.");
    Console.WriteLine($"Records read:     {result.RecordsRead}");
    Console.WriteLine($"Clusters:         {result.ClusterCount}");
    Console.WriteLine($"Avg distance:     {result.AverageDistance:F4}  (lower = tighter clusters)");
    Console.WriteLine();
    Console.WriteLine("Cluster size distribution:");

    var sorted = result.ClusterSizes
        .OrderBy(kv => kv.Key)
        .ToList();

    var max = sorted.Max(kv => kv.Value);
    foreach (var (id, size) in sorted)
    {
        var bar     = new string('█', size > 0 ? Math.Max(1, size * 30 / Math.Max(max, 1)) : 0);
        var warning = size <= 1 ? "  ⚠ degenerate" : string.Empty;
        Console.WriteLine($"  Cluster {id,2}: {size,5} incidents  {bar}{warning}");
    }

    Console.WriteLine();
    if (sorted.Any(kv => kv.Value <= 1))
        Console.WriteLine("⚠ Some clusters are degenerate (size 0 or 1). Consider reducing cluster count.");
    else if (sorted.Max(kv => kv.Value) > result.RecordsRead * 0.6)
        Console.WriteLine("⚠ One cluster dominates (>60% of incidents). Consider increasing cluster count.");
    else
        Console.WriteLine("✓ Cluster distribution looks healthy.");
}

static void ShowUsage()
{
    Console.WriteLine("Usage:");
    Console.WriteLine("  generate [outputCsvPath] [rowCount]");
    Console.WriteLine("  train [inputCsvPath] [outputModelPath] [labelColumnName]");
    Console.WriteLine("  cluster-train [inputCsvPath] [outputModelPath] [clusterCount]");
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
