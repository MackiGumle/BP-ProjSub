using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace BP_ProjSub.Server.Models;

public partial class Student
{
    public int? Semester { get; set; }

    public string? StudyForm { get; set; }

    public string? StudyType { get; set; }

    public string? Faculty { get; set; }

    public required string PersonId { get; set; }

    public virtual Person Person { get; set; } = null!;

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
