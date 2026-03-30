using System;
using Abp.Zero.EntityFrameworkCore;
using SafeGuard.Authorization.Roles;
using SafeGuard.Authorization.Users;
using SafeGuard.Domains.Case;
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

    public DbSet<EvidenceEntity> Evidences { get; set; }
    public DbSet<ChainOfCustodyEntity> ChainOfCustodies { get; set; }

    public SafeGuardDbContext(DbContextOptions<SafeGuardDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Incident>(entity =>
        {
            entity.Property(e => e.Latitude).HasPrecision(9, 6);
            entity.Property(e => e.Longitude).HasPrecision(9, 6);
            entity.Property(e => e.OccurredAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            entity.Property(e => e.ReportedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        modelBuilder.Entity<CaseEntity>(entity =>
        {
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

        modelBuilder.Entity<EvidenceEntity>(entity =>
        {
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
