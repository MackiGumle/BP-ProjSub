using System;
using System.ComponentModel.DataAnnotations;

namespace BP_ProjSub.Server.Data.Dtos;

public class SubmissionCommentDto
{
    [Required]
    public int Id { get; set; }

    public DateTime CommentDate { get; set; }

    public string FileName { get; set; } = null!;

    public int LineCommented { get; set; }

    public string Comment { get; set; } = null!;
}
