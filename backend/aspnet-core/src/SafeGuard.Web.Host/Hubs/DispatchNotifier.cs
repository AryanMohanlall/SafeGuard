using System.Threading.Tasks;
using Abp.Dependency;
using Microsoft.AspNetCore.SignalR;
using SafeGuard.Notifications;

namespace SafeGuard.Web.Host.Hubs
{
    public class DispatchNotifier : IDispatchNotifier, ITransientDependency
    {
        private readonly IHubContext<AlertHub> _hubContext;

        public DispatchNotifier(IHubContext<AlertHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task NotifyAsync(DispatchNotificationDto dispatch)
        {
            return _hubContext.Clients.All.SendAsync("DispatchUpdated", dispatch);
        }
    }
}
