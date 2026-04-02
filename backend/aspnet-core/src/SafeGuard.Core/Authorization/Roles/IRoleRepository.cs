using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace SafeGuard.Authorization.Roles;

/// <summary>
/// Repository abstraction for <see cref="Role"/> that exposes query operations
/// requiring EF Core query-filter bypass, keeping the Core layer free of any
/// EF Core references.
/// </summary>
public interface IRoleRepository : IRepository<Role, int>
{
    /// <summary>
    /// Finds a role by tenant and name, bypassing soft-delete and other global query filters.
    /// Returns null if no role matches.
    /// </summary>
    Task<Role> FindByTenantAndNameIgnoreFiltersAsync(int tenantId, string name);
}
