using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;

namespace SafeGuard.Domains.Case;

public class Case : FullAuditedEntity<Guid>
{
    [Required]
    [MaxLength(50)]
    public string CaseNumber { get; set; }         // auto-generated reference e.g. "CAS-2026-00142"

    [Required]
    [MaxLength(500)]
    public string Title { get; set; }              // short human-readable title

    [MaxLength(4000)]
    public string Summary { get; set; }            // full narrative description

    [Required]
    [MaxLength(50)]
    public string Status { get; set; }             // Draft | Open | UnderReview | PendingTrial | Closed | Void

    [Required]
    [MaxLength(20)]
    public string Severity { get; set; }           // Low | Medium | High | Critical

    [MaxLength(100)]
    public string Category { get; set; }           // Theft | Assault | Fraud | Homicide | etc.

    // Key dates
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? LastActivityAt { get; set; }  // updated on any case action

    // Court readiness
    public bool IsCourtReady { get; set; }
    public DateTime? CourtReadyAt { get; set; }

    // Outcome
    [MaxLength(200)]
    public string ClosureReason { get; set; }      // e.g. "Acquitted", "Convicted", "Withdrawn"

    // AI-generated fields from Computer Vision
    [MaxLength(2000)]
    public string AiSummary { get; set; }          // auto-generated from evidence CV analysis

    // Navigation
    public ICollection<Incidents.Incident> Incidents { get; set; }
    public ICollection<Dispatches.Dispatch> Dispatches { get; set; }
    public ICollection<Evidence.Evidence> EvidenceItems { get; set; }
    public ICollection<CaseNote> Notes { get; set; }
    public ICollection<CaseStatusHistory> StatusHistory { get; set; }
}
