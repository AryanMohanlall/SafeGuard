using SafeGuard.Configuration.Dto;
using System.Threading.Tasks;

namespace SafeGuard.Configuration;

public interface IConfigurationAppService
{
    Task ChangeUiTheme(ChangeUiThemeInput input);
}
