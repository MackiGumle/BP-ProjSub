using System;

namespace BP_ProjSub.Server.Data.Dtos;

public class AddSubmissionRating
{
    public int SubmissionId { get; set; }

    public string PersonId { get; set; } // TeacherId

    public decimal Rating { get; set; }

    public string? Note { get; set; }
}
