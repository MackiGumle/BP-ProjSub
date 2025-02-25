using System.IdentityModel.Tokens.Jwt;
using BP_ProjSub.Server.Data.Dtos.Auth;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BP_ProjSub.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Person> _userManager;
        private readonly TokenService _tokenService;
        private readonly SignInManager<Person> _signInManager;
        private readonly IConfiguration _config;

        public AuthController(UserManager<Person> userManager, TokenService tokenService,
         SignInManager<Person> signInManager, IConfiguration config)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await _userManager.FindByEmailAsync(model.Email);

                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

                if (!result.Succeeded)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                var roles = await _userManager.GetRolesAsync(user);

                var response = new LoggedInDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user, roles as List<string>),
                    Roles = await _userManager.GetRolesAsync(user),
                    Expires = DateTime.UtcNow.AddMinutes(_config.GetValue<int>("Jwt:ExpirationInMinutes"))
                };

                return Ok(response);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Unexpected server error" });
            }
        }

        [HttpPost("RequestNewToken")]
        [Authorize]
        public async Task<IActionResult> RequestNewToken([FromHeader] string Authorization)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var authToken = tokenHandler.ReadToken(Authorization.Replace("Bearer ", string.Empty)) as JwtSecurityToken;

                var email = authToken?.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Email)?.Value ?? string.Empty;

                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest(new { message = "Token does not contain email." });
                }

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                var roles = await _userManager.GetRolesAsync(user);

                var response = new LoggedInDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user, roles as List<string>),
                    Roles = await _userManager.GetRolesAsync(user),
                    Expires = DateTime.UtcNow.AddMinutes(_config.GetValue<int>("Jwt:ExpirationInMinutes"))
                };

                return Ok(response);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
        }

        [HttpPost("ActivateAccount")]
        [Authorize(Policy = "AccountActivation")]
        public async Task<IActionResult> ActivateAccount([FromHeader] string Authorization, [FromBody] string Password)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var authToken = tokenHandler.ReadToken(Authorization.Replace("Bearer ", string.Empty)) as JwtSecurityToken;

                var email = authToken?.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Email)?.Value ?? string.Empty;

                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest(new { message = "Token does not contain email." });
                }

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                var emailConfirmationToken = authToken?.Claims.FirstOrDefault(claim => claim.Type == "AccountActivation")?.Value;
                if (string.IsNullOrEmpty(emailConfirmationToken))
                {
                    return BadRequest(new { message = "Invalid email confirmation token." });
                }

                var result = await _userManager.ConfirmEmailAsync(user, emailConfirmationToken);
                if (!result.Succeeded)
                {
                    return BadRequest(new { message = $"Email confirmation failed." });
                }

                var passwordResult = await _userManager.AddPasswordAsync(user, Password);
                if (!passwordResult.Succeeded)
                {
                    return BadRequest(new { message = "Password could not be set." });
                }

                return Ok(new { message = "Account activated successfully." });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
        }
    }
}
