using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Models.Auth;

public class LoginModel
{
    [Required]
    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    public string? Password { get; set; }
    
}
