using System;
using System.Collections.Generic;

namespace BP_ProjSub.Server.Models;

public partial class Teacher
{
    public string? Office { get; set; }

    public int PersonId { get; set; }

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    public virtual Person Person { get; set; } = null!;

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
