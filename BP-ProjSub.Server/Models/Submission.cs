using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace BP_ProjSub.Server.Models;

public partial class Submission
{
    public int Id { get; set; }

    public DateTime SubmissionDate { get; set; }

    public string FileName { get; set; } = null!;

    public byte[] FileData { get; set; } = null!;

    public int AssignmentId { get; set; }

    public string PersonId { get; set; }

    [ForeignKey("AssignmentId")]
    public virtual Assignment Assignment { get; set; } = null!;

    [ForeignKey("PersonId")]
    public virtual Student Student { get; set; } = null!;

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    
    [InverseProperty("Submission")]
    public virtual ICollection<SubmissionComment> Comments { get; set; } = new List<SubmissionComment>();
}
