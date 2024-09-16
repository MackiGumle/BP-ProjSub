using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Models;

public class CreateAccountDto
{
    [Required]
    public string? Name { get; set; }

    [Required]
    public string? Surname { get; set; }

    [Required]
    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    public string? Role { get; set; }
}
