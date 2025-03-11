using System;
using BP_ProjSub.Server.Models;

namespace BP_ProjSub.Server.Data.Dtos;


public class PartialSubmissionDto
{
    public int Id { get; set; }

    public DateTime SubmissionDate { get; set; }

    public int AssignmentId { get; set; }

    public string PersonId { get; set; }

    public string StudentLogin { get; set; }

    public decimal? Rating { get; set; }

    public bool IsSuspicious { get; set; }

    public List<AssignmentViewLogDto> AssignmentViewLogs { get; set; } = new List<AssignmentViewLogDto>();
}
