using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace BP_ProjSub.Server.Models;

public partial class Person : IdentityUser
{
    // public int Id { get; set; }

    // public string Name { get; set; } = null!;

    // public string Surname { get; set; } = null!;

    // public string Email { get; set; } = null!;

    // public string Password { get; set; } = null!;

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
