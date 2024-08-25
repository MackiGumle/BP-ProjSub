using System;
using System.Collections.Generic;

namespace BP_ProjSub.Server.Models;

public partial class Submission
{
    public int Id { get; set; }

    public DateTime SubmissionDate { get; set; }

    public string FileName { get; set; } = null!;

    public byte[] FileData { get; set; } = null!;

    public int AssignmentId { get; set; }

    public string PersonId { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;

    public virtual Person Person { get; set; } = null!;

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();
}
