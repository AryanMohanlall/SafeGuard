using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using SafeGuard.Domains.Monitor;
using SafeGuard.Services.LiveStreamService.Dto;

namespace SafeGuard.Services.LiveStreamService
{
    [AbpAuthorize]
    public class LiveStreamAppService
        : AsyncCrudAppService<LiveStream, LiveStreamDto, Guid, PagedLiveStreamResultRequestDto, CreateLiveStreamDto, UpdateLiveStreamDto>,
          ILiveStreamAppService
    {
        public LiveStreamAppService(IRepository<LiveStream, Guid> repository)
            : base(repository)
        {
        }

        protected override IQueryable<LiveStream> CreateFilteredQuery(PagedLiveStreamResultRequestDto input)
        {
            return Repository.GetAll()
                .WhereIf(
                    !input.Keyword.IsNullOrWhiteSpace(),
                    stream => stream.Name.Contains(input.Keyword) ||
                              stream.Location.Contains(input.Keyword) ||
                              stream.SourceName.Contains(input.Keyword))
                .WhereIf(
                    input.IsActive.HasValue,
                    stream => stream.IsActive == input.IsActive.Value)
                .OrderBy(stream => stream.SortOrder)
                .ThenBy(stream => stream.Name);
        }

        public override async Task DeleteAsync(EntityDto<Guid> input)
        {
            var stream = await Repository.GetAsync(input.Id);
            await Repository.HardDeleteAsync(stream);
        }
    }
}
