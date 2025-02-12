using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Data.Dtos.Teacher;

public class EditAssignmentDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    public string? Type { get; set; }

    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime DateAssigned { get; set; }

    public DateTime? DueDate { get; set; }

    public long? MaxPoints { get; set; }
}
