using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace SafeGuard.EntityFrameworkCore;

public static class SafeGuardDbContextConfigurer
{
    public static void Configure(DbContextOptionsBuilder<SafeGuardDbContext> builder, string connectionString)
    {
        builder.UseSqlServer(connectionString);
    }

    public static void Configure(DbContextOptionsBuilder<SafeGuardDbContext> builder, DbConnection connection)
    {
        builder.UseSqlServer(connection);
    }
}
