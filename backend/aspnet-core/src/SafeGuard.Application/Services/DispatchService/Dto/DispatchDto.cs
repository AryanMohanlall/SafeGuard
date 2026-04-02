using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using SafeGuard.Domains.Dispatches;

namespace SafeGuard.Services.DispatchService.Dto;

[AutoMap(typeof(Dispatch))]
public class DispatchDto : EntityDto<Guid>
{
    public Guid IncidentId { get; set; }
    public string IncidentTitle { get; set; }
    public Guid? CaseId { get; set; }
    public string CaseNumber { get; set; }
    public long? OfficialUserId { get; set; }
    public string OfficialFullName { get; set; }
    public string Status { get; set; }
    public string ResponderExternalId { get; set; }
    public string ResponderRank { get; set; }
    public string ResponderName { get; set; }
    public string ResponderSector { get; set; }
    public decimal? ResponderLatitude { get; set; }
    public decimal? ResponderLongitude { get; set; }
    public decimal? IncidentLatitudeSnapshot { get; set; }
    public decimal? IncidentLongitudeSnapshot { get; set; }
    public decimal? EstimatedDistanceKm { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? EnRouteAt { get; set; }
    public DateTime? OnSceneAt { get; set; }
    public DateTime? ClearedAt { get; set; }
    public string AssignmentSource { get; set; }
    public string Notes { get; set; }
    public DateTime CreationTime { get; set; }
    public long? CreatorUserId { get; set; }
}
