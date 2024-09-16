using System;
using System.Collections.Generic;

namespace BP_ProjSub.Server.Models;

public partial class Subject
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? Language { get; set; }

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    public virtual ICollection<Teacher> Teachers { get; set; } = new List<Teacher>();
    
    public virtual ICollection<Student> Students { get; set; } = new List<Student>();
}
