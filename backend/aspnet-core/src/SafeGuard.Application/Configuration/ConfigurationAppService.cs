using Abp.Authorization;
using Abp.Runtime.Session;
using SafeGuard.Configuration.Dto;
using System.Threading.Tasks;

namespace SafeGuard.Configuration;

[AbpAuthorize]
public class ConfigurationAppService : SafeGuardAppServiceBase, IConfigurationAppService
{
    public async Task ChangeUiTheme(ChangeUiThemeInput input)
    {
        await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
    }
}
