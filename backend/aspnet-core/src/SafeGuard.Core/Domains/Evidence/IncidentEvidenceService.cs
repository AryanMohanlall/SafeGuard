using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using SafeGuard.Domains.Blockchain;
using SafeGuard.Domains.Incidents;

namespace SafeGuard.Domains.Evidence;

public class IncidentEvidenceService : DomainService, IIncidentEvidenceService
{
    private readonly IRepository<Evidence, Guid> _evidenceRepository;
    private readonly ILedgerService _ledgerService;

    public IncidentEvidenceService(
        IRepository<Evidence, Guid> evidenceRepository,
        ILedgerService ledgerService)
    {
        _evidenceRepository = evidenceRepository;
        _ledgerService = ledgerService;
    }

    public async Task SyncIncidentEvidenceAsync(Guid caseId, Incident incident, long? actorUserId = null)
    {
        if (incident == null)
        {
            return;
        }

        await EnsureEvidenceAsync(
            caseId,
            incident,
            mediaBytes: incident.ImageFile,
            fileName: incident.ImageFileName,
            contentType: incident.ImageContentType,
            type: GetImageEvidenceType(incident.ImageContentType),
            notesSuffix: "image attachment",
            actorUserId: actorUserId,
            includeDetectedObjects: true);

        await EnsureEvidenceAsync(
            caseId,
            incident,
            mediaBytes: incident.AudioFile,
            fileName: incident.AudioFileName,
            contentType: incident.AudioContentType,
            type: "Audio",
            notesSuffix: "audio attachment",
            actorUserId: actorUserId,
            includeDetectedObjects: false);
    }

    private async Task EnsureEvidenceAsync(
        Guid caseId,
        Incident incident,
        byte[] mediaBytes,
        string fileName,
        string contentType,
        string type,
        string notesSuffix,
        long? actorUserId,
        bool includeDetectedObjects)
    {
        if (mediaBytes == null || mediaBytes.Length == 0)
        {
            return;
        }

        var fileHash = ComputeSha256(mediaBytes);
        var existingEvidence = await _evidenceRepository.FirstOrDefaultAsync(e =>
            e.CaseId == caseId &&
            e.IncidentId == incident.Id &&
            e.Type == type &&
            e.FileHash == fileHash);

        if (existingEvidence != null)
        {
            return;
        }

        var evidence = new Evidence
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            IncidentId = incident.Id,
            Type = type,
            Status = "Uploaded",
            FileName = !string.IsNullOrWhiteSpace(fileName)
                ? fileName
                : $"incident-{incident.Id:N}-{type.ToLowerInvariant()}",
            ContentType = contentType,
            FileSizeBytes = mediaBytes.LongLength,
            FileHash = fileHash,
            DetectedObjects = includeDetectedObjects ? incident.DetectedObjects : null,
            CollectedAt = incident.OccurredAt,
            UploadedAt = incident.ReportedAt,
            Notes = $"Auto-generated from incident '{incident.Title}' {notesSuffix}.",
        };

        await _evidenceRepository.InsertAsync(evidence);

        var payload = JsonSerializer.Serialize(new
        {
            evidence.Id,
            evidence.CaseId,
            evidence.IncidentId,
            evidence.Type,
            evidence.FileName,
            evidence.ContentType,
            evidence.FileSizeBytes,
            evidence.FileHash,
            evidence.UploadedAt
        });

        await _ledgerService.AppendAsync(
            entityType: "Evidence",
            entityId: evidence.Id.ToString(),
            action: "RegisterEvidenceFromIncident",
            payload: payload,
            actorUserId: actorUserId);
    }

    private static string ComputeSha256(byte[] mediaBytes)
    {
        var hash = SHA256.HashData(mediaBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string GetImageEvidenceType(string contentType)
    {
        if (!string.IsNullOrWhiteSpace(contentType) &&
            contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
        {
            return "Video";
        }

        return "Photo";
    }
}
