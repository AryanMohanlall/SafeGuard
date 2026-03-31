using Microsoft.ML.Data;

namespace SafeGuard.ML.IncidentPrediction;

public class IncidentPredictionModelOutput
{
    [ColumnName("PredictedLabel")]
    public bool PredictedLabel { get; set; }

    public float Probability { get; set; }

    public float Score { get; set; }
}
