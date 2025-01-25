using System.Security.Claims;
using BP_ProjSub.Server.Data.Dtos.Account;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BP_ProjSub.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<Person> _userManager;

        public AccountController(UserManager<Person> userManager)
        {
            _userManager = userManager;
        }

        [HttpPost("changePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var emailClaim = User.FindFirst(ClaimTypes.Email);
                if (emailClaim == null)
                {
                    return Unauthorized(new {message = "Email claim not found in token."});
                }

                var user = await _userManager.FindByEmailAsync(emailClaim.Value);
                if (user == null)
                {
                    return BadRequest(new {message = "User not found."});
                }

                var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
                if (result.Succeeded)
                {
                    return Ok(new {message = "Password changed successfully."});
                }

                return BadRequest(new {message = result.Errors.Select(e => e.Description + '\n').ToList()});
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new {message = e.Message});
            }
        }

    }
}
