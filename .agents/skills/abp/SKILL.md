---
name: abp-feature
description: >
  Use this skill whenever the user wants to add a new feature, entity, module, or service
  to an ASP.NET Boilerplate (ABP) backend API built on .NET with PostgreSQL. Triggers
  include: "add a new entity", "create a new module", "I need a CRUD service for X",
  "add a feature to the backend", "scaffold a new domain object", "add an endpoint for X",
  "create a new ABP service", "new domain model", or any request to extend the backend API
  with new functionality. Use this skill even if the user just says "add X to the backend"
  without specifying ABP — if the codebase follows the layered DDD structure described here,
  this skill applies.
---

# ABP Feature Scaffold Skill

Guides Claude through adding any new feature to an ASP.NET Boilerplate (ABP) backend
following Domain-Driven Design (DDD) layered architecture with .NET and PostgreSQL.

## Solution structure

```
aspnet-core/
├── src/
│   ├── {App}.Core/                  ← Domain layer (entities, domain services)
│   ├── {App}.Application/           ← Application layer (services, DTOs)
│   ├── {App}.EntityFrameworkCore/   ← Data access (DbContext, migrations)
│   ├── {App}.Web.Core/              ← Web infrastructure (JWT, base controllers)
│   └── {App}.Web.Host/              ← Startup host (middleware, Swagger, CORS)
```

Dependency direction is strictly one-way: `Web.Host → Web.Core → Application → Core ← EntityFrameworkCore`.
No layer may reference a layer above it.

---

## Step-by-step: adding any new feature

Work through all 6 steps in order. Never skip a step.

### Step 1 — Domain entity (`{App}.Core`)

**File:** `src/{App}.Core/Domains/{Module Name}/{EntityName}.cs`

```csharp
public class {EntityName} : FullAuditedEntity<Guid>
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; }

    // Add domain properties here with data annotation validation
    // Use [Required], [MaxLength(n)], [Range(min,max)], [EmailAddress], [Phone] etc.

    // Foreign keys: declare the FK property AND the navigation property
    public Guid {RelatedEntity}Id { get; set; }

    [ForeignKey(nameof({RelatedEntity}Id))]
    public {RelatedEntity} {RelatedEntity} { get; set; }
}
```

**Rules:**
- Always extend `FullAuditedEntity<Guid>` — gives soft delete, audit timestamps, and creator tracking for free.
- Use data annotations for all property-level validation — no FluentValidation in the domain.
- Domain services (`{EntityName}Manager.cs`) go in the same folder when logic spans multiple entities or doesn't belong to a single entity.
- No EF Core, HTTP, or application-layer references here.

> **Read** `references/domain-patterns.md` for common entity patterns (enums, value objects, domain services, owned types).

---

### Step 2 — Register in DbContext (`{App}.EntityFrameworkCore`)

**File:** `src/{App}.EntityFrameworkCore/EntityFrameworkCore/{App}DbContext.cs`

Add one line per new entity:

```csharp
public DbSet<{EntityName}> {EntityNamePlural} { get; set; }
```

If the entity needs model configuration beyond what data annotations provide (UTC conversion, composite keys, table naming, owned types), add it in `OnModelCreating`:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<{EntityName}>(entity =>
    {
        entity.Property(e => e.CreatedAt)
              .HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
    });
}
```

---

### Step 3 — Create and apply a migration

```bash
cd aspnet-core
dotnet ef migrations add Add{EntityName} \
  --project src/{App}.EntityFrameworkCore \
  --startup-project src/{App}.Web.Host
```

Review the generated migration file before applying. Then apply:

```bash
dotnet ef database update \
  --project src/{App}.EntityFrameworkCore \
  --startup-project src/{App}.Web.Host
```

Or use the Migrator project:

```bash
dotnet run --project src/{App}.Migrator
```

---

### Step 4 — Create the DTO (`{App}.Application`)

**File:** `src/{App}.Application/Services/{EntityName}Service/DTO/{EntityName}Dto.cs`

```csharp
[AutoMap(typeof({EntityName}))]
public class {EntityName}Dto : EntityDto<Guid>
{
    public string Name { get; set; }

    // Mirror all properties the API consumer needs.
    // Flatten navigations — do not expose EF navigation properties directly.
    // For related entities, expose the FK ID and a flat display string, not the whole object.
    public Guid {RelatedEntity}Id { get; set; }
    public string {RelatedEntity}Name { get; set; }  // flattened from navigation
}
```

**Create input DTO for write operations if validation differs from the read DTO:**

```csharp
[AutoMap(typeof({EntityName}))]
public class Create{EntityName}Dto
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; }

    [Required]
    public Guid {RelatedEntity}Id { get; set; }
}
```

**Rules:**
- `[AutoMap(typeof(TEntity))]` is required — it configures AutoMapper automatically.
- Never expose EF navigation objects directly — flatten or explicitly nest.
- Keep read and write DTOs separate when they differ (e.g., computed fields only on read).

---

### Step 5 — Service interface (`{App}.Application`)

**File:** `src/{App}.Application/Services/{EntityName}Service/I{EntityName}AppService.cs`

**Standard CRUD (most cases):**

```csharp
public interface I{EntityName}AppService
    : IAsyncCrudAppService<{EntityName}Dto, Guid>
{
    // Add any extra methods beyond standard CRUD here
}
```

**Custom logic only (no standard CRUD):**

```csharp
public interface I{EntityName}AppService : IApplicationService
{
    Task<List<{EntityName}Dto>> GetByStatusAsync(string status);
    Task ProcessAsync(Guid id);
}
```

---

### Step 6 — Service implementation (`{App}.Application`)

**File:** `src/{App}.Application/Services/{EntityName}Service/{EntityName}AppService.cs`

**Standard CRUD:**

```csharp
[AbpAuthorize]
public class {EntityName}AppService
    : AsyncCrudAppService<{EntityName}, {EntityName}Dto, Guid>,
      I{EntityName}AppService
{
    public {EntityName}AppService(IRepository<{EntityName}, Guid> repository)
        : base(repository) { }
}
```

**Custom logic with injected dependencies:**

```csharp
[AbpAuthorize]
public class {EntityName}AppService : ApplicationService, I{EntityName}AppService
{
    private readonly IRepository<{EntityName}, Guid> _repository;
    private readonly {DomainService} _domainService;

    public {EntityName}AppService(
        IRepository<{EntityName}, Guid> repository,
        {DomainService} domainService)
    {
        _repository = repository;
        _domainService = domainService;
    }

    public async Task<List<{EntityName}Dto>> GetByStatusAsync(string status)
    {
        var items = await _repository
            .GetAll()
            .Where(x => x.Status == status)
            .ToListAsync();

        return ObjectMapper.Map<List<{EntityName}Dto>>(items);
    }
}
```

**ABP automatically exposes every public method on a registered `ApplicationService` as a REST endpoint — no controller needed.**

> **Read** `references/service-patterns.md` for filtering, sorting, pagination, including navigations, and custom endpoints.

---

## Checklist before finishing

Run through this after every feature addition:

- [ ] Entity extends `FullAuditedEntity<Guid>`
- [ ] All properties have appropriate data annotation validators
- [ ] `DbSet<T>` added to DbContext
- [ ] Migration created and reviewed — no accidental drops
- [ ] DTO has `[AutoMap(typeof(TEntity))]`
- [ ] DTO flattens navigations — no raw EF navigation properties exposed
- [ ] Service interface defined and implemented
- [ ] `[AbpAuthorize]` applied at class or method level
- [ ] No business logic in Web.Host or Web.Core layers
- [ ] No EF or HTTP references in the Core layer

---

## Cross-cutting concerns reference

| Concern | How ABP handles it |
|---|---|
| Authentication | JWT Bearer via `TokenAuthController` — no changes needed per feature |
| Authorisation | `[AbpAuthorize]` on class or method; add permission name for fine-grained control |
| Audit trail | `FullAuditedEntity` tracks created/modified/deleted automatically |
| Soft delete | `IsDeleted` flag on `FullAuditedEntity` — ABP filters deleted records from all queries |
| Validation | Data annotations on entities; ABP validates DTOs automatically before service methods run |
| Object mapping | `[AutoMap]` attribute — AutoMapper configured in `{App}ApplicationModule.cs` |
| Multi-tenancy | `TenantId` injected automatically by ABP on every entity — no manual wiring |
| Dependency injection | Castle Windsor — registered automatically for all `ApplicationService` subclasses |

---

## When to read the reference files

- **New entity has complex relationships, enums, or value objects** → read `references/domain-patterns.md`
- **Service needs filtering, pagination, includes, or custom queries** → read `references/service-patterns.md`
- **Setting up a new module from scratch (new folder, new ABP module class)** → read `references/module-setup.md`