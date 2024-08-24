using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace BP_ProjSub.Server.Models;

public partial class Person : IdentityUser
{
    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
