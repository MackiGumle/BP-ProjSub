using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Models;

public partial class SubmissionComment
{
    public int Id { get; set; }

    public DateTime CommentDate { get; set; }

    public string FileName { get; set; }

    public int LineCommented { get; set; }

    public string Comment { get; set; }

    public string PersonId { get; set; }

    public int SubmissionId { get; set; }

    [ForeignKey("PersonId")]
    [DeleteBehavior(DeleteBehavior.ClientCascade)]
    public virtual Teacher Teacher { get; set; } = null!;

    [ForeignKey("SubmissionId")]
    public virtual Submission Submission { get; set; } = null!;
}
