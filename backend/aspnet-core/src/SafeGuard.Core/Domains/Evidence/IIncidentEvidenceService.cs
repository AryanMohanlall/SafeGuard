using System;
using System.Threading.Tasks;
using SafeGuard.Domains.Incidents;

namespace SafeGuard.Domains.Evidence;

public interface IIncidentEvidenceService
{
    Task SyncIncidentEvidenceAsync(Guid caseId, Incident incident, long? actorUserId = null);
}
