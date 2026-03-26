using Abp.Events.Bus;
using Abp.Modules;
using Abp.Reflection.Extensions;
using SafeGuard.Configuration;
using SafeGuard.EntityFrameworkCore;
using SafeGuard.Migrator.DependencyInjection;
using Castle.MicroKernel.Registration;
using Microsoft.Extensions.Configuration;

namespace SafeGuard.Migrator;

[DependsOn(typeof(SafeGuardEntityFrameworkModule))]
public class SafeGuardMigratorModule : AbpModule
{
    private readonly IConfigurationRoot _appConfiguration;

    public SafeGuardMigratorModule(SafeGuardEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbSeed = true;

        _appConfiguration = AppConfigurations.Get(
            typeof(SafeGuardMigratorModule).GetAssembly().GetDirectoryPathOrNull()
        );
    }

    public override void PreInitialize()
    {
        Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
            SafeGuardConsts.ConnectionStringName
        );

        Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
        Configuration.ReplaceService(
            typeof(IEventBus),
            () => IocManager.IocContainer.Register(
                Component.For<IEventBus>().Instance(NullEventBus.Instance)
            )
        );
    }

    public override void Initialize()
    {
        IocManager.RegisterAssemblyByConvention(typeof(SafeGuardMigratorModule).GetAssembly());
        ServiceCollectionRegistrar.Register(IocManager);
    }
}
