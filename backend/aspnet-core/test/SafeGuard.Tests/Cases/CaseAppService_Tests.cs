using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.UI;
using SafeGuard.Services.CaseService;
using SafeGuard.Services.CaseService.Dto;
using SafeGuard.Services.IncidentService;
using SafeGuard.Services.IncidentService.Dto;
using Shouldly;
using Xunit;

namespace SafeGuard.Tests.Cases;

public class CaseAppService_Tests : SafeGuardTestBase
{
    private readonly ICaseAppService _caseAppService;
    private readonly IIncidentAppService _incidentAppService;

    public CaseAppService_Tests()
    {
        _caseAppService = Resolve<ICaseAppService>();
        _incidentAppService = Resolve<IIncidentAppService>();
    }

    [Fact]
    public async Task Create_ShouldGenerateCaseNumber_AndAssignIncidents()
    {
        var firstIncident = await _incidentAppService.CreateAsync(BuildIncidentDto("Case Link A"));
        var secondIncident = await _incidentAppService.CreateAsync(BuildIncidentDto("Case Link B"));

        var created = await _caseAppService.CreateAsync(BuildCaseDto("Coordinated burglary", firstIncident.Id, secondIncident.Id));

        created.Id.ShouldNotBe(Guid.Empty);
        created.CaseNumber.ShouldStartWith($"CAS-{DateTime.UtcNow.Year}-");

        await UsingDbContextAsync(async context =>
        {
            var storedCase = await context.Cases.FindAsync(created.Id);
            var linkedIncidents = context.Incidents
                .Where(incident => incident.Id == firstIncident.Id || incident.Id == secondIncident.Id)
                .ToList();

            storedCase.ShouldNotBeNull();
            storedCase!.CaseNumber.ShouldBe(created.CaseNumber);
            linkedIncidents.Count.ShouldBe(2);
            linkedIncidents.All(incident => incident.CaseId == created.Id).ShouldBeTrue();
        });
    }

    [Fact]
    public async Task Update_ShouldUnlinkRemovedIncidents()
    {
        var keepLinked = await _incidentAppService.CreateAsync(BuildIncidentDto("Stay linked"));
        var removeLinked = await _incidentAppService.CreateAsync(BuildIncidentDto("Unlink me"));
        var created = await _caseAppService.CreateAsync(BuildCaseDto("Update linked incidents", keepLinked.Id, removeLinked.Id));

        var updated = await _caseAppService.UpdateAsync(new UpdateCaseDto
        {
            Id = created.Id,
            Title = created.Title,
            Summary = created.Summary,
            Status = created.Status,
            Severity = created.Severity,
            Category = created.Category,
            IncidentIds = [keepLinked.Id],
            IsCourtReady = created.IsCourtReady,
            ClosedAt = created.ClosedAt,
            ClosureReason = created.ClosureReason,
        });

        await UsingDbContextAsync(async context =>
        {
            var storedCase = await context.Cases.FindAsync(created.Id);
            var keptIncident = await context.Incidents.FindAsync(keepLinked.Id);
            var removedIncident = await context.Incidents.FindAsync(removeLinked.Id);

            storedCase.ShouldNotBeNull();
            keptIncident.ShouldNotBeNull();
            removedIncident.ShouldNotBeNull();
            keptIncident!.CaseId.ShouldBe(created.Id);
            removedIncident!.CaseId.ShouldBeNull();
        });
    }

    [Fact]
    public async Task TransitionStatus_ShouldMarkCaseCourtReady_WhenMovedToPendingTrial()
    {
        var created = await _caseAppService.CreateAsync(BuildCaseDto("Trial prep"));

        var transitioned = await _caseAppService.TransitionStatusAsync(new TransitionStatusInput
        {
            Id = created.Id,
            ToStatus = "PendingTrial",
            Reason = "Evidence package approved",
        });

        transitioned.Status.ShouldBe("PendingTrial");
        transitioned.IsCourtReady.ShouldBeTrue();
        transitioned.CourtReadyAt.ShouldNotBeNull();
    }

    [Fact]
    public async Task TransitionStatus_ShouldRejectUnknownStatuses()
    {
        var created = await _caseAppService.CreateAsync(BuildCaseDto("Validation"));

        var error = await Should.ThrowAsync<UserFriendlyException>(() =>
            _caseAppService.TransitionStatusAsync(new TransitionStatusInput
            {
                Id = created.Id,
                ToStatus = "Archived",
            }));

        error.Message.ShouldContain("not a valid case status");
    }

    private static CreateIncidentDto BuildIncidentDto(string title) => new()
    {
        Title = title,
        Description = $"{title} description",
        Location = "100 Test Avenue",
        Anonymous = false,
        OccurredAt = DateTime.UtcNow.AddHours(-2),
        ReportedAt = DateTime.UtcNow.AddHours(-1),
    };

    private static CreateCaseDto BuildCaseDto(string title, params Guid[] incidentIds) => new()
    {
        Title = title,
        Summary = "Case summary",
        Status = "Draft",
        Severity = "High",
        Category = "Theft",
        IncidentIds = incidentIds.ToList(),
        OpenedAt = DateTime.UtcNow,
    };
}
