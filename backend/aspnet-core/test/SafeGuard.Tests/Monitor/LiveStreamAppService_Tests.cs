using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using SafeGuard.Services.LiveStreamService;
using SafeGuard.Services.LiveStreamService.Dto;
using Shouldly;
using Xunit;

namespace SafeGuard.Tests.Monitor
{
    public class LiveStreamAppService_Tests : SafeGuardTestBase
    {
        private readonly ILiveStreamAppService _liveStreamAppService;

        public LiveStreamAppService_Tests()
        {
            _liveStreamAppService = Resolve<ILiveStreamAppService>();
        }

        [Fact]
        public async Task Create_ShouldPersistLiveStream()
        {
            var created = await _liveStreamAppService.CreateAsync(new CreateLiveStreamDto
            {
                Name = "Temple Bar",
                Location = "Dublin, Ireland",
                SourceName = "EarthCam",
                SourceUrl = "https://www.earthcam.com/world/ireland/dublin/?cam=templebar",
                CamKey = "templebar",
                IsActive = true,
                SortOrder = 10,
            });

            created.Id.ShouldNotBe(Guid.Empty);
            created.Name.ShouldBe("Temple Bar");
            created.IsActive.ShouldBeTrue();

            await UsingDbContextAsync(async context =>
            {
                var stored = await context.LiveStreams.FindAsync(created.Id);
                stored.ShouldNotBeNull();
                stored.SourceUrl.ShouldContain("earthcam.com");
                stored.CamKey.ShouldBe("templebar");
            });
        }

        [Fact]
        public async Task GetAll_ShouldFilterByKeywordAndActiveState()
        {
            await _liveStreamAppService.CreateAsync(new CreateLiveStreamDto
            {
                Name = "Temple Bar",
                Location = "Dublin, Ireland",
                SourceName = "EarthCam",
                SourceUrl = "https://www.earthcam.com/world/ireland/dublin/?cam=templebar",
                CamKey = "templebar",
                IsActive = true,
                SortOrder = 1,
            });

            await _liveStreamAppService.CreateAsync(new CreateLiveStreamDto
            {
                Name = "Abbey Road Crossing",
                Location = "London, England, UK",
                SourceName = "EarthCam",
                SourceUrl = "https://www.earthcam.com/world/england/london/abbeyroad/?cam=abbeyroad_uk",
                CamKey = "abbeyroad_uk",
                IsActive = false,
                SortOrder = 2,
            });

            var filtered = await _liveStreamAppService.GetAllAsync(new PagedLiveStreamResultRequestDto
            {
                Keyword = "Abbey",
                IsActive = false,
                MaxResultCount = 20,
                SkipCount = 0,
            });

            filtered.TotalCount.ShouldBe(1);
            filtered.Items.Single().Name.ShouldBe("Abbey Road Crossing");
        }

        [Fact]
        public async Task Delete_ShouldRemoveLiveStream()
        {
            var created = await _liveStreamAppService.CreateAsync(new CreateLiveStreamDto
            {
                Name = "Mulberry Street",
                Location = "Manhattan, New York, USA",
                SourceName = "EarthCam",
                SourceUrl = "https://www.earthcam.com/usa/newyork/littleitaly/?cam=littleitaly",
                CamKey = "littleitaly",
                IsActive = true,
                SortOrder = 5,
            });

            await _liveStreamAppService.DeleteAsync(new EntityDto<Guid>(created.Id));

            await UsingDbContextAsync(async context =>
            {
                var stored = await context.LiveStreams.FindAsync(created.Id);
                stored.ShouldBeNull();
            });
        }
    }
}
