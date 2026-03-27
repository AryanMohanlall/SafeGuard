using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.UI;
using SafeGuard.Domains.Incidents;
using SafeGuard.Services.IncidentService.Dto;

namespace SafeGuard.Services.IncidentService;

[AbpAuthorize]
public class IncidentAppService
    : AsyncCrudAppService<Incident, IncidentDto, Guid, PagedIncidentResultRequestDto, CreateIncidentDto, UpdateIncidentDto>,
      IIncidentAppService
{
    public IncidentAppService(IRepository<Incident, Guid> repository)
        : base(repository)
    {
    }

    protected override IQueryable<Incident> CreateFilteredQuery(PagedIncidentResultRequestDto input)
    {
        return Repository.GetAll()
            .WhereIf(
                !input.Keyword.IsNullOrWhiteSpace(),
                r => r.Title.Contains(input.Keyword) || r.Location.Contains(input.Keyword)
            );
    }

    public async Task<IncidentAudioDto> GetAudioAsync(Guid id)
    {
        var incident = await Repository.GetAsync(id);

        if (incident.AudioFile == null || incident.AudioFile.Length == 0)
        {
            throw new UserFriendlyException("This incident does not have an audio attachment.");
        }

        return new IncidentAudioDto
        {
            Id = incident.Id,
            AudioFile = incident.AudioFile,
            AudioFileName = incident.AudioFileName,
            AudioContentType = incident.AudioContentType
        };
    }

    public async Task<IncidentImageDto> GetImageAsync(Guid id)
    {
        var incident = await Repository.GetAsync(id);

        if (incident.ImageFile == null || incident.ImageFile.Length == 0)
        {
            throw new UserFriendlyException("This incident does not have an image attachment.");
        }

        return new IncidentImageDto
        {
            Id = incident.Id,
            ImageFile = incident.ImageFile,
            ImageFileName = incident.ImageFileName,
            ImageContentType = incident.ImageContentType
        };
    }

    protected override IncidentDto MapToEntityDto(Incident entity)
    {
        var dto = base.MapToEntityDto(entity);
        dto.HasAudio = entity.AudioFile != null && entity.AudioFile.Length > 0;
        dto.HasImage = entity.ImageFile != null && entity.ImageFile.Length > 0;
        return dto;
    }
}
