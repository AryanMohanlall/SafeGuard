using System;
using Abp.Zero.EntityFrameworkCore;
using SafeGuard.Authorization.Roles;
using SafeGuard.Authorization.Users;
using SafeGuard.Domains.Reports;
using SafeGuard.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace SafeGuard.EntityFrameworkCore;

public class SafeGuardDbContext : AbpZeroDbContext<Tenant, Role, User, SafeGuardDbContext>
{
    /* Define a DbSet for each entity of the application */

    public DbSet<Report> Reports { get; set; }

    public SafeGuardDbContext(DbContextOptions<SafeGuardDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Report>(entity =>
        {
            entity.Property(e => e.Latitude)
                  .HasPrecision(9, 6);

            entity.Property(e => e.Longitude)
                  .HasPrecision(9, 6);

            entity.Property(e => e.OccurredAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            entity.Property(e => e.ReportedAt)
                  .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });
    }
}
