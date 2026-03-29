using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using SafeGuard.Services.IncidentService.Dto;


namespace SafeGuard.Services.IncidentService;

public interface IIncidentAppService
    : IAsyncCrudAppService<IncidentDto, Guid, PagedIncidentResultRequestDto, CreateIncidentDto, UpdateIncidentDto>
{
    Task<IncidentAudioDto> GetAudioAsync(Guid id);
    Task<IncidentImageDto> GetImageAsync(Guid id);
}
