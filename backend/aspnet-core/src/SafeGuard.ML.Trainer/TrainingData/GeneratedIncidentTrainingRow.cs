using System;

namespace SafeGuard.ML.Trainer.TrainingData;

public class GeneratedIncidentTrainingRow
{
    public Guid Id { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public string Location { get; set; }

    public string AudioFile { get; set; }

    public string AudioFileName { get; set; }

    public string AudioContentType { get; set; }

    public string ImageFile { get; set; }

    public string ImageFileName { get; set; }

    public string ImageContentType { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public Guid? CaseId { get; set; }

    public bool Anonymous { get; set; }

    public string DetectedObjects { get; set; }

    public DateTime OccurredAt { get; set; }

    public DateTime ReportedAt { get; set; }

    public DateTime CreationTime { get; set; }

    public Guid? CreatorId { get; set; }

    public DateTime? LastModificationTime { get; set; }

    public Guid? LastModifierId { get; set; }

    public bool IsDeleted { get; set; }

    public Guid? DeleterId { get; set; }

    public DateTime? DeletionTime { get; set; }

    public Guid ConcurrencyStamp { get; set; }

    // ── Derived temporal features ────────────────────────────────────────────
    // Pre-computed from OccurredAt so ML.NET can consume them directly
    // without needing custom transformers for DateTime arithmetic.

    /// <summary>Hour of day the incident occurred (0–23). Encodes time-of-day crime patterns.</summary>
    public int HourOfDay => OccurredAt.Hour;

    /// <summary>Day of week (0 = Sunday … 6 = Saturday). Weekend vs weekday affects detection rates.</summary>
    public int DayOfWeek => (int)OccurredAt.DayOfWeek;

    /// <summary>
    /// Minutes between the incident occurring and being reported.
    /// Short delays correlate with higher case-opening likelihood.
    /// Capped at 10,080 (7 days) to avoid extreme outliers distorting the feature.
    /// </summary>
    public float ReportDelayMinutes =>
        (float)Math.Min((ReportedAt - OccurredAt).TotalMinutes, 10_080);

    // ── ML labels ────────────────────────────────────────────────────────────

    /// <summary>
    /// Model 1 (binary): did this incident result in a formal case being opened?
    /// Base rates derived from SAPS Q3 2025 statistics per crime category.
    /// Label is probabilistic (sigmoid-sampled) — not deterministic.
    /// </summary>
    public bool CaseOpened { get; set; }

    /// <summary>
    /// Model 2 (binary): was the resulting case resolved / detected?
    /// Only meaningful when CaseOpened = true.
    /// Base rates derived from SAPS annual detection rates per crime category.
    /// </summary>
    public bool CaseResolved { get; set; }

    /// <summary>
    /// Model 3 (multiclass): crime category string label.
    /// Matches the SAPS crime taxonomy used in Q3 2025 statistics.
    /// Values: murder | sexual_offence | attempted_murder | assault_gbh |
    ///         common_assault | common_robbery | robbery_aggravating |
    ///         carjacking | robbery_residential | robbery_non_residential |
    ///         arson | malicious_damage | burglary_non_residential |
    ///         burglary_residential | motor_vehicle_theft | theft_from_vehicle |
    ///         stock_theft | theft_general | commercial_crime | drug_related |
    ///         illegal_firearms | kidnapping | cash_in_transit
    /// </summary>
    public string CrimeCategory { get; set; }

    /// <summary>
    /// Legacy binary label kept for backward compatibility with existing
    /// binary trainer pipelines. Mirrors CaseOpened.
    /// </summary>
    public bool Label { get; set; }
}