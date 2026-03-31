using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using SafeGuard.Notifications;
using SafeGuard.Web.Host.Hubs;
using Shouldly;
using Xunit;

namespace SafeGuard.Web.Tests.Hubs;

public class IncidentAlertNotifier_Tests
{
    private static ConcurrentDictionary<string, HashSet<string>> UserConnections =>
        (ConcurrentDictionary<string, HashSet<string>>)typeof(AlertHub)
            .GetField("UserConnections", BindingFlags.NonPublic | BindingFlags.Static)!
            .GetValue(null)!;

    public IncidentAlertNotifier_Tests()
    {
        UserConnections.Clear();
    }

    [Fact]
    public async Task NotifyAsync_ShouldBroadcastToAll_WhenNoExcludedUserIsProvided()
    {
        var allProxy = Substitute.For<IClientProxy>();
        var clients = Substitute.For<IHubClients>();
        var hubContext = Substitute.For<IHubContext<AlertHub>>();
        var notifier = new IncidentAlertNotifier(hubContext);
        var alert = new IncidentAlertDto();

        clients.All.Returns(allProxy);
        hubContext.Clients.Returns(clients);

        await notifier.NotifyAsync(alert);

        await allProxy.Received(1).SendCoreAsync(
            "NewIncident",
            Arg.Is<object[]>(args => args.Length == 1 && ReferenceEquals(args[0], alert)),
            Arg.Any<CancellationToken>());
        clients.DidNotReceive().AllExcept(Arg.Any<IReadOnlyList<string>>());
    }

    [Fact]
    public async Task NotifyAsync_ShouldExcludeKnownConnections_WhenExcludedUserHasActiveConnections()
    {
        var excludedProxy = Substitute.For<IClientProxy>();
        var clients = Substitute.For<IHubClients>();
        var hubContext = Substitute.For<IHubContext<AlertHub>>();
        var notifier = new IncidentAlertNotifier(hubContext);
        var alert = new IncidentAlertDto();

        UserConnections["42"] = new HashSet<string> { "conn-1", "conn-2" };
        clients.AllExcept(Arg.Any<IReadOnlyList<string>>()).Returns(excludedProxy);
        hubContext.Clients.Returns(clients);

        await notifier.NotifyAsync(alert, 42);

        clients.Received(1).AllExcept(Arg.Is<IReadOnlyList<string>>(connections =>
            connections.Count == 2 &&
            connections.Contains("conn-1") &&
            connections.Contains("conn-2")));
        await excludedProxy.Received(1).SendCoreAsync(
            "NewIncident",
            Arg.Is<object[]>(args => args.Length == 1 && ReferenceEquals(args[0], alert)),
            Arg.Any<CancellationToken>());
    }
}
