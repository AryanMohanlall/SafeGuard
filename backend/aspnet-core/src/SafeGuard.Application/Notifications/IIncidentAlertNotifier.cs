using System.Threading.Tasks;

namespace SafeGuard.Notifications;

public interface IIncidentAlertNotifier
{
    Task NotifyAsync(IncidentAlertDto alert);
}
