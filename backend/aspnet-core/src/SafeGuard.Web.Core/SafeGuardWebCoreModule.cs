using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.SignalR;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Zero.Configuration;
using SafeGuard.Authentication.JwtBearer;
using SafeGuard.ML.IncidentPrediction;
using SafeGuard.ML.IncidentClustering;
using SafeGuard.Services.ImageAnalysisService;
using SafeGuard.Services.IncidentClusteringService;
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
            ConfigureIncidentClustering();
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

        private void ConfigureIncidentClustering()
        {
            var configuredModelPath = _appConfiguration["ML:IncidentClustering:ModelPath"];
            var modelPath = string.IsNullOrWhiteSpace(configuredModelPath)
                ? Path.Combine(_env.ContentRootPath, "App_Data", "ML", "incident-clustering-model.zip")
                : configuredModelPath;

            if (!Path.IsPathRooted(modelPath))
            {
                modelPath = Path.Combine(_env.ContentRootPath, modelPath);
            }

            var configuredCsvPath = _appConfiguration["ML:IncidentClustering:DefaultTrainingCsvPath"];
            var csvPath = string.IsNullOrWhiteSpace(configuredCsvPath)
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads", "incident-training-data.csv")
                : configuredCsvPath;

            if (!string.IsNullOrWhiteSpace(csvPath) && !Path.IsPathRooted(csvPath))
            {
                csvPath = Path.Combine(_env.ContentRootPath, csvPath);
            }

            var directory = Path.GetDirectoryName(modelPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var clusteringConfig = new IncidentClusteringModelConfiguration
            {
                ModelPath = modelPath,
                DefaultTrainingCsvPath = csvPath,
                ClusterCount = ParseInt(_appConfiguration["ML:IncidentClustering:NumberOfClusters"], 6)
            };

            var suggestionOptions = new IncidentCaseSuggestionOptions
            {
                MinimumIncidentCount = ParseInt(_appConfiguration["ML:IncidentClustering:SuggestionRules:MinimumIncidentCount"], 2),
                MaximumTimeSpanHours = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:MaximumTimeSpanHours"], 72d),
                MaximumClusterRadiusKm = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:MaximumClusterRadiusKm"], 20d),
                MinimumConfidenceScore = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:MinimumConfidenceScore"], 0.55d),
                SizeWeight = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:SizeWeight"], 0.2d),
                TimeWeight = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:TimeWeight"], 0.25d),
                GeoWeight = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:GeoWeight"], 0.25d),
                CategoryWeight = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:CategoryWeight"], 0.15d),
                ObjectWeight = ParseDouble(_appConfiguration["ML:IncidentClustering:SuggestionRules:ObjectWeight"], 0.15d)
            };

            IocManager.IocContainer.Register(
                Component.For<IncidentClusteringModelConfiguration>().Instance(clusteringConfig),
                Component.For<IncidentCaseSuggestionOptions>().Instance(suggestionOptions),
                Component.For<IIncidentClusteringService>().ImplementedBy<MlNetIncidentClusteringService>().LifestyleSingleton()
            );
        }

        private static int ParseInt(string rawValue, int fallback)
        {
            return int.TryParse(rawValue, out var parsed) ? parsed : fallback;
        }

        private static double ParseDouble(string rawValue, double fallback)
        {
            return double.TryParse(rawValue, out var parsed) ? parsed : fallback;
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
