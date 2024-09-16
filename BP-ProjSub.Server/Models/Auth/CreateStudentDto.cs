using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Models.Auth;

public class CreateStudentDto
{
    [Required]
    public string Name { get; set; } = null!;
    
    [Required]
    public string Surname { get; set; } = null!;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
