using System;
using Abp.Application.Services;
using SafeGuard.Services.EvidenceService.Dto;

namespace SafeGuard.Services.EvidenceService;

public interface IEvidenceAppService
    : IAsyncCrudAppService<EvidenceDto, Guid, PagedEvidenceResultRequestDto, CreateEvidenceDto, UpdateEvidenceDto>
{
}
