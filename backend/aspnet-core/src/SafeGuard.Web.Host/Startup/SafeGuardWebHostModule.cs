using Abp.Modules;
using Abp.Reflection.Extensions;
using SafeGuard.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace SafeGuard.Web.Host.Startup
{
    [DependsOn(
       typeof(SafeGuardWebCoreModule))]
    public class SafeGuardWebHostModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public SafeGuardWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SafeGuardWebHostModule).GetAssembly());
        }
    }
}
