using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using SafeGuard.Domains.Reports;

namespace SafeGuard.Services.ReportService.Dto;

[AutoMap(typeof(Report))]
public class ReportDto : EntityDto<Guid>
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public bool Anonymous { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime ReportedAt { get; set; }
    public DateTime CreationTime { get; set; }
    public long? CreatorUserId { get; set; }
}
