using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;

namespace SafeGuard.Domains.Case;

public class CaseNote : FullAuditedEntity<Guid>
{
    [Required]
    public Guid CaseId { get; set; }

    [ForeignKey(nameof(CaseId))]
    public Case Case { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Content { get; set; }

    [MaxLength(100)]
    public string AuthorName { get; set; }
}
