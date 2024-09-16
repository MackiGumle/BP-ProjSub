using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Models;

public partial class Rating
{
    [Key]
    // [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime Time { get; set; }

    [Precision(5, 2)]
    public decimal Value { get; set; }

    public string? Note { get; set; }

    public int SubmissionId { get; set; }

    public string? PersonId { get; set; }

    [ForeignKey("PersonId")]
    public virtual Teacher? Teacher { get; set; } = null!;

    [ForeignKey("SubmissionId")]
    public virtual Submission Submission { get; set; } = null!;
}
