using System;

namespace SafeGuard.Notifications;

public class IncidentAlertDto
{
    public Guid Id { get; set; }
    public long? CreatorUserId { get; set; }
    public string Title { get; set; }
    public string Location { get; set; }
    public DateTime OccurredAt { get; set; }
    public bool Anonymous { get; set; }
}
