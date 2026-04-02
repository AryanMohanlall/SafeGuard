using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using SafeGuard.Authorization.Users;

namespace SafeGuard.Domains.Dispatches;

public class Dispatch : FullAuditedEntity<Guid>
{
    [Required]
    public Guid IncidentId { get; set; }

    [ForeignKey(nameof(IncidentId))]
    public Incidents.Incident Incident { get; set; }

    public Guid? CaseId { get; set; }

    [ForeignKey(nameof(CaseId))]
    public Case.Case Case { get; set; }

    public long? OfficialUserId { get; set; }

    [ForeignKey(nameof(OfficialUserId))]
    public User OfficialUser { get; set; }

    [Required]
    [MaxLength(32)]
    public string Status { get; set; } // Dispatched | EnRoute | OnScene | Cleared | Cancelled

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

    [Range(typeof(decimal), "-90", "90")]
    public decimal? ResponderLatitude { get; set; }

    [Range(typeof(decimal), "-180", "180")]
    public decimal? ResponderLongitude { get; set; }

    [Range(typeof(decimal), "-90", "90")]
    public decimal? IncidentLatitudeSnapshot { get; set; }

    [Range(typeof(decimal), "-180", "180")]
    public decimal? IncidentLongitudeSnapshot { get; set; }

    [Range(typeof(decimal), "0", "10000")]
    public decimal? EstimatedDistanceKm { get; set; }

    [Required]
    public DateTime AssignedAt { get; set; }

    public DateTime? EnRouteAt { get; set; }

    public DateTime? OnSceneAt { get; set; }

    public DateTime? ClearedAt { get; set; }

    [MaxLength(50)]
    public string AssignmentSource { get; set; } // Manual | Automatic

    [MaxLength(2000)]
    public string Notes { get; set; }
}
