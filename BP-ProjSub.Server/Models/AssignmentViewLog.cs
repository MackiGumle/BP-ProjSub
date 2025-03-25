using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace BP_ProjSub.Server.Models;

public class AssignmentViewLog
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public string UserId { get; set; }
    public string IpAddress { get; set; }
    public DateTime ViewedOn { get; set; }

    [ForeignKey("AssignmentId")]
    public Assignment Assignment { get; set; }
    [ForeignKey("UserId")]
    public Student Student { get; set; }
}
