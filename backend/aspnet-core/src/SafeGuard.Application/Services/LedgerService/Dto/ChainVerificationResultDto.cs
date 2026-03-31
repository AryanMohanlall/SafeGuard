namespace SafeGuard.Services.LedgerService.Dto;

public class ChainVerificationResultDto
{
    public bool IsValid { get; set; }
    public int TotalEntries { get; set; }
    public int FirstTamperedIndex { get; set; }
    public string FailureReason { get; set; }
}
