using System.Threading.Tasks;
using Abp.Dependency;
using Microsoft.AspNetCore.SignalR;
using SafeGuard.Notifications;

namespace SafeGuard.Web.Host.Hubs
{
    public class IncidentAlertNotifier : IIncidentAlertNotifier, ITransientDependency
    {
        private readonly IHubContext<AlertHub> _hubContext;

        public IncidentAlertNotifier(IHubContext<AlertHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task NotifyAsync(IncidentAlertDto alert)
        {
            return _hubContext.Clients.All.SendAsync("NewIncident", alert);
        }
    }
}
