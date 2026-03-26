using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace SafeGuard.Controllers
{
    public abstract class SafeGuardControllerBase : AbpController
    {
        protected SafeGuardControllerBase()
        {
            LocalizationSourceName = SafeGuardConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
