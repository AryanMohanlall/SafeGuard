using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using SafeGuard.Domains.Monitor;

namespace SafeGuard.Services.LiveStreamService.Dto
{
    [AutoMap(typeof(LiveStream))]
    public class LiveStreamDto : EntityDto<Guid>
    {
        public string Name { get; set; }
        public string Location { get; set; }
        public string SourceName { get; set; }
        public string SourceUrl { get; set; }
        public string CamKey { get; set; }
        public string ThumbnailUrl { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreationTime { get; set; }
        public long? CreatorUserId { get; set; }
    }
}
