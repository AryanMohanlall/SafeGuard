using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Authorization.Users;
using Abp.Domain.Services;
using Abp.IdentityFramework;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.AspNetCore.Identity;
using SafeGuard.Authorization.Roles;
using SafeGuard.MultiTenancy;

namespace SafeGuard.Authorization.Users;

public class UserRegistrationManager : DomainService
{
    public IAbpSession AbpSession { get; set; }

    private readonly TenantManager _tenantManager;
    private readonly UserManager _userManager;
    private readonly RoleManager _roleManager;
    private readonly IRoleRepository _roleRepository;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserRegistrationManager(
        TenantManager tenantManager,
        UserManager userManager,
        RoleManager roleManager,
        IRoleRepository roleRepository,
        IPasswordHasher<User> passwordHasher)
    {
        _tenantManager = tenantManager;
        _userManager = userManager;
        _roleManager = roleManager;
        _roleRepository = roleRepository;
        _passwordHasher = passwordHasher;

        AbpSession = NullAbpSession.Instance;
    }

    public async Task<User> RegisterAsync(
        string name,
        string surname,
        string emailAddress,
        string userName,
        string plainPassword,
        string roleName,
        bool isEmailConfirmed)
    {
        CheckForTenant();

        var tenant = await GetActiveTenantAsync();
        using (CurrentUnitOfWork.SetTenantId(tenant.Id))
        {
            ValidateRegistrationRole(roleName);
            var role = await EnsureRegistrationRoleAsync(tenant.Id, roleName);

            var user = new User
            {
                TenantId = tenant.Id,
                Name = name,
                Surname = surname,
                EmailAddress = emailAddress,
                IsActive = true,
                UserName = userName,
                IsEmailConfirmed = isEmailConfirmed,
                Roles = new List<UserRole>()
            };

            user.SetNormalizedNames();

            await _userManager.InitializeOptionsAsync(tenant.Id);

            CheckErrors(await _userManager.CreateAsync(user, plainPassword));
            await CurrentUnitOfWork.SaveChangesAsync();

            CheckErrors(await _userManager.AddToRoleAsync(user, role.Name));
            await CurrentUnitOfWork.SaveChangesAsync();

            return user;
        }
    }

    private static void ValidateRegistrationRole(string roleName)
    {
        if (roleName != StaticRoleNames.Tenants.Citizen &&
            roleName != StaticRoleNames.Tenants.Official)
        {
            throw new UserFriendlyException("Users may only register as Citizen or Official.");
        }
    }

    private async Task<Role> EnsureRegistrationRoleAsync(int tenantId, string roleName)
    {
        var role = await _roleRepository.FindByTenantAndNameIgnoreFiltersAsync(tenantId, roleName);

        if (role != null)
        {
            return role;
        }

        role = new Role(tenantId, roleName, roleName)
        {
            IsStatic = true
        };
        role.SetNormalizedName();

        CheckErrors(await _roleManager.CreateAsync(role));
        await CurrentUnitOfWork.SaveChangesAsync();

        return role;
    }

    private void CheckForTenant()
    {
        if (!AbpSession.TenantId.HasValue)
        {
            throw new InvalidOperationException("Can not register host users!");
        }
    }

    private async Task<Tenant> GetActiveTenantAsync()
    {
        if (!AbpSession.TenantId.HasValue)
        {
            return null;
        }

        return await GetActiveTenantAsync(AbpSession.TenantId.Value);
    }

    private async Task<Tenant> GetActiveTenantAsync(int tenantId)
    {
        var tenant = await _tenantManager.FindByIdAsync(tenantId);
        if (tenant == null)
        {
            throw new UserFriendlyException(L("UnknownTenantId{0}", tenantId));
        }

        if (!tenant.IsActive)
        {
            throw new UserFriendlyException(L("TenantIdIsNotActive{0}", tenantId));
        }

        return tenant;
    }

    protected virtual void CheckErrors(IdentityResult identityResult)
    {
        identityResult.CheckErrors(LocalizationManager);
    }
}
