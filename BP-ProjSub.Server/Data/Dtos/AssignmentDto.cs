using System;

namespace BP_ProjSub.Server.Data.Dtos;

public class AssignmentDto
{
    public int Id { get; set; }

    public string? Type { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime DateAssigned { get; set; }

    public DateTime? DueDate { get; set; }

    public long? MaxPoints { get; set; }
}
