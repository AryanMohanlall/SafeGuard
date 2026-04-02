using System;
using System.ComponentModel.DataAnnotations;

namespace SafeGuard.Services.DispatchService.Dto;

public class TransitionDispatchStatusInput
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(32)]
    public string ToStatus { get; set; }

    [MaxLength(2000)]
    public string Notes { get; set; }
}
