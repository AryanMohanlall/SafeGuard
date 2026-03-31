using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using SafeGuard.Services.CaseService.Dto;

namespace SafeGuard.Services.CaseService;

public interface ICaseAppService
    : IAsyncCrudAppService<CaseDto, Guid, PagedCaseResultRequestDto, CreateCaseDto, UpdateCaseDto>
{
    Task<CaseDto> TransitionStatusAsync(TransitionStatusInput input);
}
