using System;
using Abp.Application.Services.Dto;

namespace SafeGuard.Services.IncidentService.Dto;

public class IncidentImageDto : EntityDto<Guid>
{
    public byte[] ImageFile { get; set; }
    public string ImageFileName { get; set; }
    public string ImageContentType { get; set; }
}
