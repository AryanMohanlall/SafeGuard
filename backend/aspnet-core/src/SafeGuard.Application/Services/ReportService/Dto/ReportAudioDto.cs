using System;
using Abp.Application.Services.Dto;

namespace SafeGuard.Services.ReportService.Dto;

public class ReportAudioDto : EntityDto<Guid>
{
    public byte[] AudioFile { get; set; }
    public string AudioFileName { get; set; }
    public string AudioContentType { get; set; }
}
