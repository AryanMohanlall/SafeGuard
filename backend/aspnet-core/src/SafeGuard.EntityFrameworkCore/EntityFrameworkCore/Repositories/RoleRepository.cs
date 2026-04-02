using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SafeGuard.Authorization.Roles;

namespace SafeGuard.EntityFrameworkCore.Repositories;

public class RoleRepository : SafeGuardRepositoryBase<Role, int>, IRoleRepository
{
    private readonly IDbContextProvider<SafeGuardDbContext> _dbContextProvider;

    public RoleRepository(IDbContextProvider<SafeGuardDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
        _dbContextProvider = dbContextProvider;
    }

    public Task<Role> FindByTenantAndNameIgnoreFiltersAsync(int tenantId, string name)
    {
        return _dbContextProvider.GetDbContext().Roles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Name == name);
    }
}
