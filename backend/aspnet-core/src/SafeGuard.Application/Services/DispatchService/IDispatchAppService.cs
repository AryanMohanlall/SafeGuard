using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using SafeGuard.Services.DispatchService.Dto;

namespace SafeGuard.Services.DispatchService;

public interface IDispatchAppService
    : IAsyncCrudAppService<DispatchDto, Guid, PagedDispatchResultRequestDto, CreateDispatchDto, UpdateDispatchDto>
{
    Task<DispatchDto> TransitionStatusAsync(TransitionDispatchStatusInput input);
    Task<DispatchDto> CompleteMyDispatchAsync(EntityDto<Guid> input);
}
