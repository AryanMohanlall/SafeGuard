using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace SafeGuard.Services.CaseService.Dto;

[AutoMap(typeof(Domains.Case.Case))]
public class UpdateCaseDto : EntityDto<Guid>
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; }

    [MaxLength(4000)]
    public string Summary { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; }

    [Required]
    [MaxLength(20)]
    public string Severity { get; set; }

    [MaxLength(100)]
    public string Category { get; set; }

    public List<Guid> IncidentIds { get; set; } = new();

    public bool IsCourtReady { get; set; }

    public DateTime? ClosedAt { get; set; }

    [MaxLength(200)]
    public string ClosureReason { get; set; }
}
