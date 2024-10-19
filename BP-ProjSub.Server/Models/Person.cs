using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace BP_ProjSub.Server.Models;

public partial class Person : IdentityUser
{
    public virtual Teacher? Teacher { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Admin? Admin { get; set; }
}
