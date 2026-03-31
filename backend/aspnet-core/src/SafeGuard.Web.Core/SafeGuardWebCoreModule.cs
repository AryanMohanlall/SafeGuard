using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.SignalR;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Zero.Configuration;
using SafeGuard.Authentication.JwtBearer;
using SafeGuard.ML.IncidentPrediction;
using SafeGuard.Services.ImageAnalysisService;
using SafeGuard.Services.IncidentPredictionService;
using SafeGuard.Configuration;
using Castle.MicroKernel.Registration;
using SafeGuard.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IO;
using System.Text;

namespace SafeGuard
{
    [DependsOn(
         typeof(SafeGuardApplicationModule),
         typeof(SafeGuardEntityFrameworkModule),
         typeof(AbpAspNetCoreModule)
        , typeof(AbpAspNetCoreSignalRModule)
     )]
    public class SafeGuardWebCoreModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public SafeGuardWebCoreModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void PreInitialize()
        {
            Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
                SafeGuardConsts.ConnectionStringName
            );

            // Use database for language management
            Configuration.Modules.Zero().LanguageManagement.EnableDbLocalization();

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SafeGuardApplicationModule).GetAssembly()
                 );

            ConfigureTokenAuth();
            ConfigureAzureComputerVision();
            ConfigureIncidentPrediction();
        }

        private void ConfigureTokenAuth()
        {
            IocManager.Register<TokenAuthConfiguration>();
            var tokenAuthConfig = IocManager.Resolve<TokenAuthConfiguration>();

            tokenAuthConfig.SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appConfiguration["Authentication:JwtBearer:SecurityKey"]));
            tokenAuthConfig.Issuer = _appConfiguration["Authentication:JwtBearer:Issuer"];
            tokenAuthConfig.Audience = _appConfiguration["Authentication:JwtBearer:Audience"];
            tokenAuthConfig.SigningCredentials = new SigningCredentials(tokenAuthConfig.SecurityKey, SecurityAlgorithms.HmacSha256);
            tokenAuthConfig.Expiration = TimeSpan.FromDays(1);
        }

        private void ConfigureAzureComputerVision()
        {
            IocManager.Register<AzureComputerVisionConfiguration>();
            var config = IocManager.Resolve<AzureComputerVisionConfiguration>();
            config.ApiKey = _appConfiguration["AzureComputerVision:ApiKey"];
            config.Endpoint = _appConfiguration["AzureComputerVision:Endpoint"];
        }

        private void ConfigureIncidentPrediction()
        {
            var configuredPath = _appConfiguration["ML:IncidentPrediction:ModelPath"];
            var modelPath = string.IsNullOrWhiteSpace(configuredPath)
                ? Path.Combine(_env.ContentRootPath, "App_Data", "ML", "incident-prediction-model.zip")
                : configuredPath;

            if (!Path.IsPathRooted(modelPath))
            {
                modelPath = Path.Combine(_env.ContentRootPath, modelPath);
            }

            var directory = Path.GetDirectoryName(modelPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var config = new IncidentPredictionModelConfiguration
            {
                ModelPath = modelPath
            };

            IocManager.IocContainer.Register(
                Component.For<IncidentPredictionModelConfiguration>().Instance(config),
                Component.For<IIncidentPredictionService>().ImplementedBy<MlNetIncidentPredictionService>().LifestyleSingleton()
            );
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SafeGuardWebCoreModule).GetAssembly());
        }

        public override void PostInitialize()
        {
            IocManager.Resolve<ApplicationPartManager>()
                .AddApplicationPartsIfNotAddedBefore(typeof(SafeGuardWebCoreModule).Assembly);
        }
    }
}
