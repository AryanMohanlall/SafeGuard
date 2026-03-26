using System.ComponentModel.DataAnnotations;

namespace SafeGuard.Users.Dto;

public class ChangeUserLanguageDto
{
    [Required]
    public string LanguageName { get; set; }
}