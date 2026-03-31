using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace SafeGuard.Services.LedgerService.Dto;

[AutoMap(typeof(Domains.Blockchain.LedgerEntry))]
public class LedgerEntryDto : EntityDto<Guid>
{
    public string EntityType { get; set; }
    public string EntityId { get; set; }
    public string Action { get; set; }
    public string Payload { get; set; }
    public string DataHash { get; set; }
    public string PreviousHash { get; set; }
    public string ChainHash { get; set; }
    public long? ActorUserId { get; set; }
    public DateTime RecordedAt { get; set; }
    public string ServerSignature { get; set; }
}
