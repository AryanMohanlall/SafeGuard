using System;
using Abp.Application.Services.Dto;

namespace SafeGuard.Services.IncidentService.Dto;

public class IncidentAudioDto : EntityDto<Guid>
{
    public byte[] AudioFile { get; set; }
    public string AudioFileName { get; set; }
    public string AudioContentType { get; set; }
}
