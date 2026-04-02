using System;
using System.ComponentModel.DataAnnotations;
using Abp.AutoMapper;
using SafeGuard.Domains.Dispatches;

namespace SafeGuard.Services.DispatchService.Dto;

[AutoMap(typeof(Dispatch))]
public class CreateDispatchDto
{
    [Required]
    public Guid IncidentId { get; set; }

    public Guid? CaseId { get; set; }

    [Required]
    public long OfficialUserId { get; set; }

    [Required]
    [MaxLength(32)]
    public string Status { get; set; } = "Dispatched";

    [Required]
    [MaxLength(64)]
    public string ResponderExternalId { get; set; }

    [Required]
    [MaxLength(50)]
    public string ResponderRank { get; set; }

    [Required]
    [MaxLength(256)]
    public string ResponderName { get; set; }

    [MaxLength(128)]
    public string ResponderSector { get; set; }

    public decimal? ResponderLatitude { get; set; }
    public decimal? ResponderLongitude { get; set; }
    public decimal? IncidentLatitudeSnapshot { get; set; }
    public decimal? IncidentLongitudeSnapshot { get; set; }
    public decimal? EstimatedDistanceKm { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? EnRouteAt { get; set; }
    public DateTime? OnSceneAt { get; set; }
    public DateTime? ClearedAt { get; set; }

    [MaxLength(50)]
    public string AssignmentSource { get; set; } = "Manual";

    [MaxLength(2000)]
    public string Notes { get; set; }
}
