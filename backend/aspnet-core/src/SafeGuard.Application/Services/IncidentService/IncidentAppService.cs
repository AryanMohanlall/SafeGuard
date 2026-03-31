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
using SafeGuard.Domains.Evidence;
using SafeGuard.Notifications;
using SafeGuard.Services.ImageAnalysisService;
using SafeGuard.Services.IncidentService.Dto;

namespace SafeGuard.Services.IncidentService;

[AbpAuthorize]
public class IncidentAppService
    : AsyncCrudAppService<Incident, IncidentDto, Guid, PagedIncidentResultRequestDto, CreateIncidentDto, UpdateIncidentDto>,
      IIncidentAppService
{
    private readonly IImageAnalysisService _imageAnalysisService;
    private readonly IIncidentAlertNotifier _alertNotifier;
    private readonly IIncidentEvidenceService _incidentEvidenceService;

    public IncidentAppService(
        IRepository<Incident, Guid> repository,
        IImageAnalysisService imageAnalysisService,
        IIncidentAlertNotifier alertNotifier,
        IIncidentEvidenceService incidentEvidenceService)
        : base(repository)
    {
        _imageAnalysisService = imageAnalysisService;
        _alertNotifier = alertNotifier;
        _incidentEvidenceService = incidentEvidenceService;
    }

    public override async Task<IncidentDto> CreateAsync(CreateIncidentDto input)
    {
        var dto = await base.CreateAsync(input);

        if (input.ImageFile != null && input.ImageFile.Length > 0)
        {
            var detectedObjects = await _imageAnalysisService.AnalyzeImageAsync(input.ImageFile);
            if (detectedObjects != null)
            {
                var incident = await Repository.GetAsync(dto.Id);
                incident.DetectedObjects = detectedObjects;
                await Repository.UpdateAsync(incident);
                dto.DetectedObjects = detectedObjects;
            }
        }

        if (dto.CaseId.HasValue)
        {
            var incident = await Repository.GetAsync(dto.Id);
            await _incidentEvidenceService.SyncIncidentEvidenceAsync(
                dto.CaseId.Value,
                incident,
                AbpSession.UserId);
        }

        await _alertNotifier.NotifyAsync(new IncidentAlertDto
        {
            Id = dto.Id,
            CreatorUserId = AbpSession.UserId,
            Title = dto.Title,
            Location = dto.Location,
            OccurredAt = dto.OccurredAt,
            Anonymous = dto.Anonymous
        }, AbpSession.UserId);

        return dto;
    }

    public override async Task<IncidentDto> UpdateAsync(UpdateIncidentDto input)
    {
        var dto = await base.UpdateAsync(input);

        if (input.ImageFile != null && input.ImageFile.Length > 0)
        {
            var detectedObjects = await _imageAnalysisService.AnalyzeImageAsync(input.ImageFile);
            if (detectedObjects != null)
            {
                var incident = await Repository.GetAsync(dto.Id);
                incident.DetectedObjects = detectedObjects;
                await Repository.UpdateAsync(incident);
                dto.DetectedObjects = detectedObjects;
            }
        }

        if (dto.CaseId.HasValue)
        {
            var incident = await Repository.GetAsync(dto.Id);
            await _incidentEvidenceService.SyncIncidentEvidenceAsync(
                dto.CaseId.Value,
                incident,
                AbpSession.UserId);
        }

        return dto;
    }

    protected override IQueryable<Incident> CreateFilteredQuery(PagedIncidentResultRequestDto input)
    {
        return Repository.GetAll()
            .WhereIf(
                !input.Keyword.IsNullOrWhiteSpace(),
                r => r.Title.Contains(input.Keyword) || r.Location.Contains(input.Keyword)
            )
            .WhereIf(
                input.CaseId.HasValue,
                r => r.CaseId == input.CaseId.Value
            );
    }

    public override async Task DeleteAsync(EntityDto<Guid> input)
    {
        var incident = await Repository.GetAsync(input.Id);
        await Repository.HardDeleteAsync(incident);
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
