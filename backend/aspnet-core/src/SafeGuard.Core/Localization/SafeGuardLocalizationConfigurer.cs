using Abp.Configuration.Startup;
using Abp.Localization.Dictionaries;
using Abp.Localization.Dictionaries.Xml;
using Abp.Reflection.Extensions;

namespace SafeGuard.Localization;

public static class SafeGuardLocalizationConfigurer
{
    public static void Configure(ILocalizationConfiguration localizationConfiguration)
    {
        localizationConfiguration.Sources.Add(
            new DictionaryBasedLocalizationSource(SafeGuardConsts.LocalizationSourceName,
                new XmlEmbeddedFileLocalizationDictionaryProvider(
                    typeof(SafeGuardLocalizationConfigurer).GetAssembly(),
                    "SafeGuard.Localization.SourceFiles"
                )
            )
        );
    }
}
