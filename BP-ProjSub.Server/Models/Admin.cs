using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BP_ProjSub.Server.Models;

public class Admin
{
    [Key]
    public string PersonId { get; set; }

    [ForeignKey("PersonId")]
    public virtual Person Person { get; set; }
}
