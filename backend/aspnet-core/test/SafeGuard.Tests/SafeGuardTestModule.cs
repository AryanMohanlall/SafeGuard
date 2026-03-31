using Abp.AutoMapper;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Modules;
using Abp.Net.Mail;
using Abp.TestBase;
using Abp.Zero.Configuration;
using Abp.Zero.EntityFrameworkCore;
using SafeGuard.EntityFrameworkCore;
using SafeGuard.Notifications;
using SafeGuard.Services.ImageAnalysisService;
using SafeGuard.Tests.DependencyInjection;
using Castle.MicroKernel.Registration;
using NSubstitute;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

namespace SafeGuard.Tests;

[DependsOn(
    typeof(SafeGuardApplicationModule),
    typeof(SafeGuardEntityFrameworkModule),
    typeof(AbpTestBaseModule)
    )]
public class SafeGuardTestModule : AbpModule
{
    public SafeGuardTestModule(SafeGuardEntityFrameworkModule abpProjectNameEntityFrameworkModule)
    {
        abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
        abpProjectNameEntityFrameworkModule.SkipDbSeed = true;
    }

    public override void PreInitialize()
    {
        Configuration.UnitOfWork.Timeout = TimeSpan.FromMinutes(30);
        Configuration.UnitOfWork.IsTransactional = false;

        // Disable static mapper usage since it breaks unit tests (see https://github.com/aspnetboilerplate/aspnetboilerplate/issues/2052)
        Configuration.Modules.AbpAutoMapper().UseStaticMapper = false;

        Configuration.BackgroundJobs.IsJobExecutionEnabled = false;

        // Use database for language management
        Configuration.Modules.Zero().LanguageManagement.EnableDbLocalization();

        RegisterFakeService<AbpZeroDbMigrator<SafeGuardDbContext>>();
        RegisterFakeService<IIncidentAlertNotifier>();

        Configuration.ReplaceService<IEmailSender, NullEmailSender>(DependencyLifeStyle.Transient);

        IocManager.IocContainer.Register(
            Component.For<AzureComputerVisionConfiguration>()
                .Instance(new AzureComputerVisionConfiguration { ApiKey = "", Endpoint = "" })
                .LifestyleSingleton()
        );

        var testConfiguration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Blockchain:HmacSecret"] = "test-ledger-secret"
            })
            .Build();

        IocManager.IocContainer.Register(
            Component.For<IConfiguration>()
                .Instance(testConfiguration)
                .LifestyleSingleton()
        );
    }

    public override void Initialize()
    {
        ServiceCollectionRegistrar.Register(IocManager);
    }

    private void RegisterFakeService<TService>() where TService : class
    {
        IocManager.IocContainer.Register(
            Component.For<TService>()
                .UsingFactoryMethod(() => Substitute.For<TService>())
                .LifestyleSingleton()
        );
    }
}
