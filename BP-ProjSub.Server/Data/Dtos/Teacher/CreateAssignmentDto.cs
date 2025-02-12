using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Data.Dtos;

public class CreateAssignmentDto
{
    [Required]
    // Currently predefined types are: Homework, Test, Project
    public string? Type { get; set; }

    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    // TODO: Also the date that the assignment should be visible
    public DateTime? DateAssigned { get; set; }

    public DateTime? DueDate { get; set; }

    public long? MaxPoints { get; set; }

    [Required]
    public int SubjectId { get; set; }
    
    public List<IFormFile>? Files { get; set; }
}
