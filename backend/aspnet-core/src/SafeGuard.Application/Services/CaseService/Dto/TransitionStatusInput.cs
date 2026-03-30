using System;

namespace SafeGuard.Services.CaseService.Dto;

public class TransitionStatusInput
{
    public Guid Id { get; set; }
    public string ToStatus { get; set; }
    public string Reason { get; set; }
}
