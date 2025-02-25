using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BP_ProjSub.Server.Models;

public class Teacher
{
    [Key]
    public string PersonId { get; set; }
    
    [ForeignKey("PersonId")]
    public virtual Person Person { get; set; } = null!;

    [InverseProperty("Teacher")]
    public virtual ICollection<Assignment> AssignmentsCreated { get; set; } = new List<Assignment>();

    [InverseProperty("Teachers")]
    public virtual ICollection<Subject> SubjectsTaught { get; set; } = new List<Subject>();

    [InverseProperty("Teacher")]
    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    [InverseProperty("Teacher")]
    public virtual ICollection<SubmissionComment> Comments { get; set; } = new List<SubmissionComment>();
}
