using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Data.Dtos.Account;

public class ChangePasswordDto
{
    [Required]
    public string? OldPassword { get; set; }

    [Required]
    public string? NewPassword { get; set; }
}
