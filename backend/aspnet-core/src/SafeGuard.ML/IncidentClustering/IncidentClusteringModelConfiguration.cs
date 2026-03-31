namespace SafeGuard.ML.IncidentClustering;

public class IncidentClusteringModelConfiguration
{
    public string ModelPath { get; set; }

    public string DefaultTrainingCsvPath { get; set; }

    public int ClusterCount { get; set; } = 6;
}
