using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.AutoMapper;

namespace SafeGuard.Services.CaseService.Dto;

[AutoMap(typeof(Domains.Case.Case))]
public class CreateCaseDto
{
    [Required]
    [MaxLength(500)]
    public string Title { get; set; }

    [MaxLength(4000)]
    public string Summary { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Draft";

    [Required]
    [MaxLength(20)]
    public string Severity { get; set; }

    [MaxLength(100)]
    public string Category { get; set; }

    public List<Guid> IncidentIds { get; set; } = new();

    [Required]
    public DateTime OpenedAt { get; set; }
}
