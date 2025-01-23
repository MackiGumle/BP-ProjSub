using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Data.Dtos.Teacher;

public class CreateSubjectDto
{
    [Required]
    public string Name { get; set; } = null!;
    
    public string Description { get; set; } = null!;
    
}