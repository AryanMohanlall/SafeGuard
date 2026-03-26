using Abp.AspNetCore;
using Abp.AspNetCore.TestBase;
using Abp.Modules;
using Abp.Reflection.Extensions;
using SafeGuard.EntityFrameworkCore;
using SafeGuard.Web.Startup;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace SafeGuard.Web.Tests;

[DependsOn(
    typeof(SafeGuardWebMvcModule),
    typeof(AbpAspNetCoreTestBaseModule)
)]
public class SafeGuardWebTestModule : AbpModule
{
    public SafeGuardWebTestModule(SafeGuardEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
    }

    public override void PreInitialize()
    {
        Configuration.UnitOfWork.IsTransactional = false; //EF Core InMemory DB does not support transactions.
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(SafeGuardWebTestModule).GetAssembly());
    }

    public override void PostInitialize()
    {
        IocManager.Resolve<ApplicationPartManager>()
            .AddApplicationPartsIfNotAddedBefore(typeof(SafeGuardWebMvcModule).Assembly);
    }
}