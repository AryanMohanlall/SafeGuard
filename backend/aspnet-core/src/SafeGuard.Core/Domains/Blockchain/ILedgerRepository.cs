using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace SafeGuard.Domains.Blockchain;

/// <summary>
/// Repository abstraction for <see cref="LedgerEntry"/> that exposes only the async
/// query operations that <see cref="LedgerService"/> requires, keeping the Core layer
/// free of any EF Core references.
/// </summary>
public interface ILedgerRepository : IRepository<LedgerEntry, Guid>
{
    /// <summary>Returns the ChainHash of the most recently recorded entry, or null if the ledger is empty.</summary>
    Task<string> GetLastChainHashAsync();

    /// <summary>Returns all entries ordered by RecordedAt ascending.</summary>
    Task<List<LedgerEntry>> GetAllOrderedAsync(CancellationToken ct = default);
}
