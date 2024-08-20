using System;
using System.Collections.Generic;

namespace BP_ProjSub.Server.Models;

public partial class Rating
{
    public DateTime Time { get; set; }

    public decimal? Rating1 { get; set; }

    public string? Note { get; set; }

    public int TeacherPersonId { get; set; }

    public int SubmissionId { get; set; }

    public virtual Submission Submission { get; set; } = null!;

    public virtual Teacher TeacherPerson { get; set; } = null!;
}
