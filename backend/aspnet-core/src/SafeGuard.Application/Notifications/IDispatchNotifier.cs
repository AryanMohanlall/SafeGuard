using System.Threading.Tasks;

namespace SafeGuard.Notifications;

public interface IDispatchNotifier
{
    Task NotifyAsync(DispatchNotificationDto dispatch);
}
