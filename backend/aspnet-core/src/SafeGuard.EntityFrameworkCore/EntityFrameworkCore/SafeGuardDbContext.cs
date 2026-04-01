using System;
using Abp.Zero.EntityFrameworkCore;
using SafeGuard.Authorization.Roles;
using SafeGuard.Authorization.Users;
using SafeGuard.Domains.Blockchain;
using SafeGuard.Domains.Case;
using SafeGuard.Domains.Dispatches;
using SafeGuard.Domains.Incidents;
using SafeGuard.MultiTenancy;
using Microsoft.EntityFrameworkCore;
using CaseEntity = SafeGuard.Domains.Case.Case;
using EvidenceEntity = SafeGuard.Domains.Evidence.Evidence;
using ChainOfCustodyEntity = SafeGuard.Domains.Evidence.ChainOfCustody;

namespace SafeGuard.EntityFrameworkCore;

public class SafeGuardDbContext : AbpZeroDbContext<Tenant, Role, User, SafeGuardDbContext>
{
    public DbSet<Incident> Incidents { get; set; }

    public DbSet<CaseEntity> Cases { get; set; }
    public DbSet<CaseNote> CaseNotes { get; set; }
    public DbSet<CaseStatusHistory> CaseStatusHistories { get; set; }
    public DbSet<Dispatch> Dispatches { get; set; }

    public DbSet<EvidenceEntity> Evidences { get; set; }
    public DbSet<ChainOfCustodyEntity> ChainOfCustodies { get; set; }

    public DbSet<LedgerEntry> LedgerEntries { get; set; }

    public SafeGuardDbContext(DbContextOptions<SafeGuardDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Incident>(entity =>
        {
            entity.HasOne(i => i.Case)
                  .WithMany(c => c.Incidents)
                  .HasForeignKey(i => i.CaseId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(i => i.CaseId);

            entity.Property(e => e.Latitude).HasPrecision(9, 6);
            entity.Property(e => e.Longitude).HasPrecision(9, 6);
            entity.Property(e => e.OccurredAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            entity.Property(e => e.ReportedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        modelBuilder.Entity<CaseEntity>(entity =>
        {
            entity.HasMany(c => c.Dispatches)
                  .WithOne(d => d.Case)
                  .HasForeignKey(d => d.CaseId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(c => c.EvidenceItems)
                  .WithOne()
                  .HasForeignKey(e => e.CaseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(c => c.Notes)
                  .WithOne(n => n.Case)
                  .HasForeignKey(n => n.CaseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(c => c.StatusHistory)
                  .WithOne(h => h.Case)
                  .HasForeignKey(h => h.CaseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.OpenedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        modelBuilder.Entity<Dispatch>(entity =>
        {
            entity.HasOne(d => d.Incident)
                  .WithMany(i => i.Dispatches)
                  .HasForeignKey(d => d.IncidentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.OfficialUser)
                  .WithMany()
                  .HasForeignKey(d => d.OfficialUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(d => d.IncidentId);
            entity.HasIndex(d => d.CaseId);
            entity.HasIndex(d => d.OfficialUserId);
            entity.HasIndex(d => d.Status);
            entity.Property(d => d.ResponderLatitude).HasPrecision(9, 6);
            entity.Property(d => d.ResponderLongitude).HasPrecision(9, 6);
            entity.Property(d => d.IncidentLatitudeSnapshot).HasPrecision(9, 6);
            entity.Property(d => d.IncidentLongitudeSnapshot).HasPrecision(9, 6);
            entity.Property(d => d.EstimatedDistanceKm).HasPrecision(8, 2);
            entity.Property(d => d.AssignedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            entity.Property(d => d.EnRouteAt)
                  .HasConversion(v => v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
            entity.Property(d => d.OnSceneAt)
                  .HasConversion(v => v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
            entity.Property(d => d.ClearedAt)
                  .HasConversion(v => v, v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
        });

        modelBuilder.Entity<LedgerEntry>(entity =>
        {
            // Immutable — no updates or deletes should ever be issued against this table.
            entity.Property(e => e.RecordedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            // Fast lookups by entity and time.
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
            entity.HasIndex(e => e.RecordedAt);
        });

        modelBuilder.Entity<EvidenceEntity>(entity =>
        {
            entity.HasOne(e => e.Incident)
                  .WithMany()
                  .HasForeignKey(e => e.IncidentId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.IncidentId);

            entity.HasMany(e => e.CustodyLog)
                  .WithOne(c => c.Evidence)
                  .HasForeignKey(c => c.EvidenceId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.ManipulationScore).HasPrecision(5, 2);
            entity.Property(e => e.CollectedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            entity.Property(e => e.UploadedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });
    }
}
