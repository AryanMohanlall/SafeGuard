using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using SafeGuard.Domains.Incidents;

namespace SafeGuard.Services.IncidentService.Dto;

[AutoMap(typeof(Incident))]
public class IncidentDto : EntityDto<Guid>
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public bool HasAudio { get; set; }
    public string AudioFileName { get; set; }
    public string AudioContentType { get; set; }
    public bool HasImage { get; set; }
    public string ImageFileName { get; set; }
    public string ImageContentType { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public Guid? CaseId { get; set; }
    public bool Anonymous { get; set; }
    public string DetectedObjects { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime ReportedAt { get; set; }
    public DateTime CreationTime { get; set; }
    public long? CreatorUserId { get; set; }

    // Populated at query time by the prediction service — not mapped from the entity.
    public float? CaseLikelihood { get; set; }
    public string PriorityTag { get; set; }
}
