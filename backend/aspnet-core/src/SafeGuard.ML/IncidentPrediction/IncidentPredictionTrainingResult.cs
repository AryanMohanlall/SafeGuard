namespace SafeGuard.ML.IncidentPrediction;

public class IncidentPredictionTrainingResult
{
    public int RecordsRead { get; set; }

    public double Accuracy { get; set; }

    public double AreaUnderRocCurve { get; set; }

    public double PositivePrecision { get; set; }

    public double PositiveRecall { get; set; }

    public string ModelPath { get; set; }
}
