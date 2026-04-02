using System;
using Abp.Application.Services;
using SafeGuard.Services.LiveStreamService.Dto;

namespace SafeGuard.Services.LiveStreamService
{
    public interface ILiveStreamAppService
        : IAsyncCrudAppService<LiveStreamDto, Guid, PagedLiveStreamResultRequestDto, CreateLiveStreamDto, UpdateLiveStreamDto>
    {
    }
}
