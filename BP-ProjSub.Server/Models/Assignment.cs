using System;
using System.Collections.Generic;

namespace BP_ProjSub.Server.Models;

public partial class Assignment
{
    public int Id { get; set; }

    public string? Type { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateTime? DateAssigned { get; set; }

    public DateTime? DueDate { get; set; }

    public long? MaxPoints { get; set; }

    public int TeacherPersonId { get; set; }

    public int SubjectId { get; set; }

    public virtual Subject Subject { get; set; } = null!;

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    public virtual Teacher TeacherPerson { get; set; } = null!;
}
