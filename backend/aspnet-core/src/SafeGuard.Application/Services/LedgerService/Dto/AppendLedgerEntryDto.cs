using System.ComponentModel.DataAnnotations;

namespace SafeGuard.Services.LedgerService.Dto;

public class AppendLedgerEntryDto
{
    [Required]
    [MaxLength(50)]
    public string EntityType { get; set; }

    [Required]
    [MaxLength(200)]
    public string EntityId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; }

    [Required]
    public string Payload { get; set; }

    public long? ActorUserId { get; set; }
}
