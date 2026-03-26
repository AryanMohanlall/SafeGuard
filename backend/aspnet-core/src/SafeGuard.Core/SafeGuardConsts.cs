using SafeGuard.Debugging;

namespace SafeGuard;

public class SafeGuardConsts
{
    public const string LocalizationSourceName = "SafeGuard";

    public const string ConnectionStringName = "Default";

    public const bool MultiTenancyEnabled = true;


    /// <summary>
    /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
    /// </summary>
    public static readonly string DefaultPassPhrase =
        DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "04c89c40c78a484d9824af9b4e738aa0";
}
