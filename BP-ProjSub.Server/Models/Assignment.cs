using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BP_ProjSub.Server.Models;

public partial class Assignment
{
    public int Id { get; set; }

    public string? Type { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime DateAssigned { get; set; }

    public DateTime? DueDate { get; set; }

    public long? MaxPoints { get; set; }

    public int SubjectId { get; set; }

    public string PersonId { get; set; }

    [ForeignKey("PersonId")]
    public virtual Teacher Teacher { get; set; } = null!;

    [ForeignKey("SubjectId")]
    public virtual Subject Subject { get; set; } = null!;

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    public virtual ICollection<AssignmentViewLog> AssignmentViewLogs { get; set; } = new List<AssignmentViewLog>();
}
