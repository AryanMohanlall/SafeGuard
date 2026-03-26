using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using SafeGuard.Authorization;

namespace SafeGuard;

[DependsOn(
    typeof(SafeGuardCoreModule),
    typeof(AbpAutoMapperModule))]
public class SafeGuardApplicationModule : AbpModule
{
    public override void PreInitialize()
    {
        Configuration.Authorization.Providers.Add<SafeGuardAuthorizationProvider>();
    }

    public override void Initialize()
    {
        var thisAssembly = typeof(SafeGuardApplicationModule).GetAssembly();

        IocManager.RegisterAssemblyByConvention(thisAssembly);

        Configuration.Modules.AbpAutoMapper().Configurators.Add(
            // Scan the assembly for classes which inherit from AutoMapper.Profile
            cfg => cfg.AddMaps(thisAssembly)
        );
    }
}
