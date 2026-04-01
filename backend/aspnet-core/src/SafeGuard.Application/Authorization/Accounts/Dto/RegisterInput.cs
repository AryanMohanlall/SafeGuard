using Abp.Auditing;
using Abp.Authorization.Users;
using Abp.Extensions;
using SafeGuard.Authorization.Roles;
using SafeGuard.Validation;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SafeGuard.Authorization.Accounts.Dto;

public class RegisterInput : IValidatableObject
{
    [Required]
    [StringLength(AbpUserBase.MaxNameLength)]
    public string Name { get; set; }

    [Required]
    [StringLength(AbpUserBase.MaxSurnameLength)]
    public string Surname { get; set; }

    [Required]
    [StringLength(AbpUserBase.MaxUserNameLength)]
    public string UserName { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(AbpUserBase.MaxEmailAddressLength)]
    public string EmailAddress { get; set; }

    [Required]
    [StringLength(AbpUserBase.MaxPlainPasswordLength)]
    [DisableAuditing]
    public string Password { get; set; }

    [DisableAuditing]
    public string CaptchaResponse { get; set; }

    [Required]
    [StringLength(32)]
    public string RoleName { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!UserName.IsNullOrEmpty())
        {
            if (!UserName.Equals(EmailAddress) && ValidationHelper.IsEmail(UserName))
            {
                yield return new ValidationResult("Username cannot be an email address unless it's the same as your email address!");
            }
        }

        if (!RoleName.IsNullOrWhiteSpace() &&
            RoleName != StaticRoleNames.Tenants.Citizen &&
            RoleName != StaticRoleNames.Tenants.Official)
        {
            yield return new ValidationResult("Role must be either Citizen or Official.", [nameof(RoleName)]);
        }
    }
}
