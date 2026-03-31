using System.Threading.Tasks;
using Abp.Dependency;
using Microsoft.AspNetCore.SignalR;
using SafeGuard.Notifications;
using System.Collections.Generic;

namespace SafeGuard.Web.Host.Hubs
{
    public class IncidentAlertNotifier : IIncidentAlertNotifier, ITransientDependency
    {
        private readonly IHubContext<AlertHub> _hubContext;

        public IncidentAlertNotifier(IHubContext<AlertHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task NotifyAsync(IncidentAlertDto alert, long? excludedUserId = null)
        {
            if (excludedUserId.HasValue)
            {
                IReadOnlyList<string> excludedConnections = AlertHub.GetConnectionsForUser(excludedUserId.Value.ToString());
                if (excludedConnections.Count > 0)
                {
                    return _hubContext.Clients.AllExcept(excludedConnections).SendAsync("NewIncident", alert);
                }
            }

            return _hubContext.Clients.All.SendAsync("NewIncident", alert);
        }
    }
}
