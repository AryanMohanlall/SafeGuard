using System;

namespace SafeGuard.Notifications;

public class DispatchNotificationDto
{
    public Guid DispatchId { get; set; }
    public Guid IncidentId { get; set; }
    public long? OfficialUserId { get; set; }
    public string Status { get; set; }
    public DateTime UpdatedAt { get; set; }
}
