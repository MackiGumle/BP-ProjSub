using System.Security.Claims;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Identity;

public class LockoutMiddleware
{
    private readonly RequestDelegate _next;

    public LockoutMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Resolve the scoped UserManager<Person> for this request.
        var userManager = context.RequestServices.GetRequiredService<UserManager<Person>>();

        var userIdClaim = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userIdClaim))
        {
            var user = await userManager.FindByIdAsync(userIdClaim);
            if (user != null && await userManager.IsLockedOutAsync(user))
            {
                if (context.Request.Headers.ContainsKey("Authorization"))
                {
                    Console.WriteLine($"[i] Account {user.Email} is locked out");
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("Account is locked out");
                    return;
                }
            }
        }

        await _next(context);
    }
}
