using System;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using SafeGuard.Services.IncidentService;
using SafeGuard.Services.IncidentService.Dto;
using Shouldly;
using Xunit;

namespace SafeGuard.Tests.Incidents;

public class IncidentAppService_Tests : SafeGuardTestBase
{
    private readonly IIncidentAppService _incidentAppService;

    public IncidentAppService_Tests()
    {
        _incidentAppService = Resolve<IIncidentAppService>();
    }

    private static CreateIncidentDto MakeCreateDto(string title = "Test Incident") => new()
    {
        Title = title,
        Description = "A test description",
        Location = "123 Test Street",
        Anonymous = false,
        OccurredAt = DateTime.UtcNow.AddHours(-1),
        ReportedAt = DateTime.UtcNow,
    };

    [Fact]
    public async Task Create_ShouldPersistIncident()
    {
        var dto = await _incidentAppService.CreateAsync(MakeCreateDto());

        dto.Id.ShouldNotBe(Guid.Empty);
        dto.Title.ShouldBe("Test Incident");
        dto.Location.ShouldBe("123 Test Street");
        dto.Anonymous.ShouldBeFalse();
    }

    [Fact]
    public async Task GetAll_ShouldReturnCreatedIncidents()
    {
        await _incidentAppService.CreateAsync(MakeCreateDto("Incident A"));
        await _incidentAppService.CreateAsync(MakeCreateDto("Incident B"));

        var result = await _incidentAppService.GetAllAsync(
            new PagedIncidentResultRequestDto { MaxResultCount = 20, SkipCount = 0 });

        result.TotalCount.ShouldBeGreaterThanOrEqualTo(2);
        result.Items.ShouldContain(i => i.Title == "Incident A");
        result.Items.ShouldContain(i => i.Title == "Incident B");
    }

    [Fact]
    public async Task Get_ShouldReturnCorrectIncident()
    {
        var created = await _incidentAppService.CreateAsync(MakeCreateDto("Get Me"));

        var fetched = await _incidentAppService.GetAsync(new EntityDto<Guid>(created.Id));

        fetched.Id.ShouldBe(created.Id);
        fetched.Title.ShouldBe("Get Me");
    }

    [Fact]
    public async Task Update_ShouldModifyIncident()
    {
        var created = await _incidentAppService.CreateAsync(MakeCreateDto("Original Title"));

        var updated = await _incidentAppService.UpdateAsync(new UpdateIncidentDto
        {
            Id = created.Id,
            Title = "Updated Title",
            Description = "Updated description",
            Location = "456 New Street",
            Anonymous = true,
            OccurredAt = created.OccurredAt,
            ReportedAt = created.ReportedAt,
        });

        updated.Title.ShouldBe("Updated Title");
        updated.Location.ShouldBe("456 New Street");
        updated.Anonymous.ShouldBeTrue();
    }

    [Fact]
    public async Task Delete_ShouldRemoveIncident()
    {
        var created = await _incidentAppService.CreateAsync(MakeCreateDto("To Be Deleted"));

        await _incidentAppService.DeleteAsync(new EntityDto<Guid>(created.Id));

        var result = await _incidentAppService.GetAllAsync(
            new PagedIncidentResultRequestDto { MaxResultCount = 100, SkipCount = 0 });

        result.Items.ShouldNotContain(i => i.Id == created.Id);
    }

    [Fact]
    public async Task GetAll_WithKeyword_ShouldFilterResults()
    {
        await _incidentAppService.CreateAsync(MakeCreateDto("Robbery on Main St"));
        await _incidentAppService.CreateAsync(MakeCreateDto("Vandalism at Park"));

        var result = await _incidentAppService.GetAllAsync(
            new PagedIncidentResultRequestDto { MaxResultCount = 20, SkipCount = 0, Keyword = "Robbery" });

        result.Items.ShouldContain(i => i.Title == "Robbery on Main St");
        result.Items.ShouldNotContain(i => i.Title == "Vandalism at Park");
    }

    [Fact]
    public async Task Create_WithCoordinates_ShouldPersistLatLon()
    {
        var dto = await _incidentAppService.CreateAsync(new CreateIncidentDto
        {
            Title = "GPS Incident",
            Description = "Has coordinates",
            Location = "Central Park",
            Anonymous = false,
            OccurredAt = DateTime.UtcNow.AddHours(-1),
            ReportedAt = DateTime.UtcNow,
            Latitude = 40.785091m,
            Longitude = -73.968285m,
        });

        dto.Latitude.ShouldBe(40.785091m);
        dto.Longitude.ShouldBe(-73.968285m);
    }

    [Fact]
    public async Task Create_WithImage_ShouldSetHasImageTrue()
    {
        var dto = await _incidentAppService.CreateAsync(new CreateIncidentDto
        {
            Title = "Image Incident",
            Description = "Has an image",
            Location = "Somewhere",
            Anonymous = false,
            OccurredAt = DateTime.UtcNow.AddHours(-1),
            ReportedAt = DateTime.UtcNow,
            ImageFile = new byte[] { 1, 2, 3 },
            ImageFileName = "photo.jpg",
            ImageContentType = "image/jpeg",
        });

        dto.HasImage.ShouldBeTrue();
        dto.ImageFileName.ShouldBe("photo.jpg");
    }
}
