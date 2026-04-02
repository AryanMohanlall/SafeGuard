using Abp.Application.Services.Dto;

namespace SafeGuard.Services.LiveStreamService.Dto
{
    public class PagedLiveStreamResultRequestDto : PagedResultRequestDto
    {
        public string Keyword { get; set; }
        public bool? IsActive { get; set; }
    }
}
