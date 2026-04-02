using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SafeGuard.Domains.Blockchain;

namespace SafeGuard.EntityFrameworkCore.Repositories;

public class LedgerRepository : SafeGuardRepositoryBase<LedgerEntry, Guid>, ILedgerRepository
{
    private readonly IDbContextProvider<SafeGuardDbContext> _dbContextProvider;

    public LedgerRepository(IDbContextProvider<SafeGuardDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
        _dbContextProvider = dbContextProvider;
    }

    public Task<string> GetLastChainHashAsync()
    {
        return _dbContextProvider.GetDbContext().LedgerEntries
            .OrderByDescending(e => e.RecordedAt)
            .Select(e => e.ChainHash)
            .FirstOrDefaultAsync();
    }

    public Task<List<LedgerEntry>> GetAllOrderedAsync(CancellationToken ct = default)
    {
        return _dbContextProvider.GetDbContext().LedgerEntries
            .OrderBy(e => e.RecordedAt)
            .ToListAsync(ct);
    }
}
