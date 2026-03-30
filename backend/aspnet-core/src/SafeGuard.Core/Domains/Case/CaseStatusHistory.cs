using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;

namespace SafeGuard.Domains.Case;

public class CaseStatusHistory : FullAuditedEntity<Guid>
{
    [Required]
    public Guid CaseId { get; set; }

    [ForeignKey(nameof(CaseId))]
    public Case Case { get; set; }

    [Required]
    [MaxLength(50)]
    public string FromStatus { get; set; }

    [Required]
    [MaxLength(50)]
    public string ToStatus { get; set; }

    public DateTime ChangedAt { get; set; }

    [MaxLength(500)]
    public string Reason { get; set; }
}
