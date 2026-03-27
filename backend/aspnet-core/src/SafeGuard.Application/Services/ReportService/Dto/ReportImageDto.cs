using System;
using Abp.Application.Services.Dto;

namespace SafeGuard.Services.ReportService.Dto;

public class ReportImageDto : EntityDto<Guid>
{
    public byte[] ImageFile { get; set; }
    public string ImageFileName { get; set; }
    public string ImageContentType { get; set; }
}
