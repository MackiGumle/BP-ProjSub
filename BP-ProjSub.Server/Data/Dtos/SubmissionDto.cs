using System;

namespace BP_ProjSub.Server.Data.Dtos;


public class PartialSubmissionDto
{
    public int Id { get; set; }

    public DateTime SubmissionDate { get; set; }

    public int AssignmentId { get; set; }

    public string PersonId { get; set; }

    public string StudentLogin { get; set; }

    public decimal? Rating { get; set; }
}
