using System;

namespace BP_ProjSub.Server.Data.Dtos;

public class AddSubmissionRating
{
    public int SubmissionId { get; set; }

    public decimal Rating { get; set; }

    public string? Note { get; set; }
}
