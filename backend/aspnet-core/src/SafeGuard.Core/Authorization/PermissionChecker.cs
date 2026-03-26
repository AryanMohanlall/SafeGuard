using Abp.Authorization;
using SafeGuard.Authorization.Roles;
using SafeGuard.Authorization.Users;

namespace SafeGuard.Authorization;

public class PermissionChecker : PermissionChecker<Role, User>
{
    public PermissionChecker(UserManager userManager)
        : base(userManager)
    {
    }
}
