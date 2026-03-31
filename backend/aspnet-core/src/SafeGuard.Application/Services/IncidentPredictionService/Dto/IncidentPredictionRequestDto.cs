using System;
using System.ComponentModel.DataAnnotations;

namespace SafeGuard.Services.IncidentPredictionService.Dto;

public class IncidentPredictionRequestDto
{
    [Required]
    [MaxLength(256)]
    public string Title { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Description { get; set; }

    [Required]
    [MaxLength(512)]
    public string Location { get; set; }

    public bool Anonymous { get; set; }

    public bool HasAudio { get; set; }

    public bool HasImage { get; set; }

    public string DetectedObjects { get; set; }

    [Required]
    public DateTime OccurredAt { get; set; }

    [Required]
    public DateTime ReportedAt { get; set; }
}
