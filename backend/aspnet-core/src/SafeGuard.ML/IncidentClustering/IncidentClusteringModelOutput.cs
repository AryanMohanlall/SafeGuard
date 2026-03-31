using Microsoft.ML.Data;

namespace SafeGuard.ML.IncidentClustering;

public class IncidentClusteringModelOutput
{
    [ColumnName("PredictedLabel")]
    public uint PredictedLabel { get; set; }

    public float[] Score { get; set; }
}
