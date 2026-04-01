using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using System.ComponentModel.DataAnnotations.Schema;

namespace SafeGuard.Domains.Incidents;

public class Incident : FullAuditedEntity<Guid>
{
    [Required]
    [MaxLength(256)]
    public string Title { get; set; }

    [MaxLength(4000)]
    public string Description { get; set; }

    [Required]
    [MaxLength(512)]
    public string Location { get; set; }

    public byte[] AudioFile { get; set; }

    [MaxLength(256)]
    public string AudioFileName { get; set; }

    [MaxLength(128)]
    public string AudioContentType { get; set; }

    public byte[] ImageFile { get; set; }

    [MaxLength(256)]
    public string ImageFileName { get; set; }

    [MaxLength(128)]
    public string ImageContentType { get; set; }

    [Range(typeof(decimal), "-90", "90")]
    public decimal? Latitude { get; set; }

    [Range(typeof(decimal), "-180", "180")]
    public decimal? Longitude { get; set; }

    public Guid? CaseId { get; set; }

    [ForeignKey(nameof(CaseId))]
    public Case.Case Case { get; set; }

    public bool Anonymous { get; set; }

    public string DetectedObjects { get; set; }

    [Required]
    public DateTime OccurredAt { get; set; }

    [Required]
    public DateTime ReportedAt { get; set; }

    public System.Collections.Generic.ICollection<Dispatches.Dispatch> Dispatches { get; set; }
}
