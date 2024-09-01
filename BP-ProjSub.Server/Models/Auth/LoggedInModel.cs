using System;

namespace BP_ProjSub.Server.Models.Auth;

public class LoggedInModel
{
    public required string Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Token { get; set; }
    public required IList<string> Roles { get; set; }
}
