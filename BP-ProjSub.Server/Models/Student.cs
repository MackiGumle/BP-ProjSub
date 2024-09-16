using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BP_ProjSub.Server.Models;

public class Student
{
    [Key]
    public string PersonId { get; set; }

    [ForeignKey("PersonId")]
    public virtual Person Person { get; set; }

    [InverseProperty("Student")]
    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    [InverseProperty("Students")]
    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
