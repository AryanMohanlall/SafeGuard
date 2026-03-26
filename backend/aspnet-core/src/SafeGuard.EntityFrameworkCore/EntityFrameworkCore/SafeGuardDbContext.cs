using Abp.Zero.EntityFrameworkCore;
using SafeGuard.Authorization.Roles;
using SafeGuard.Authorization.Users;
using SafeGuard.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace SafeGuard.EntityFrameworkCore;

public class SafeGuardDbContext : AbpZeroDbContext<Tenant, Role, User, SafeGuardDbContext>
{
    /* Define a DbSet for each entity of the application */

    public SafeGuardDbContext(DbContextOptions<SafeGuardDbContext> options)
        : base(options)
    {
    }
}
