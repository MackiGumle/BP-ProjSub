using System.IdentityModel.Tokens.Jwt;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Models.Auth;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        public AuthController(UserManager<Person> userManager, TokenService tokenService, SignInManager<Person> signInManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
        }

        // This endpoint should be removed
        [HttpPost("registerTeacher")]
        [Authorize(Roles = "Admin")]
        private async Task<IActionResult> Register([FromBody] CreateAccountDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = new Person
                {
                    UserName = model.Name + model.Surname,
                    Email = model.Email
                };

                var result = await _userManager.CreateAsync(user, "Password123!");

                if (result.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, "Student");

                    return Ok(new LoggedInDto
                    {
                        Id = user.Id,
                        Username = user.UserName,
                        Email = user.Email,
                        Token = _tokenService.CreateToken(user, new List<string> { "Student" }),
                        Roles = await _userManager.GetRolesAsync(user)
                    });
                }

                return BadRequest(result.Errors);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
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
                    return Unauthorized("Invalid credentials");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

                if (!result.Succeeded)
                {
                    return Unauthorized("Invalid credentials");
                }

                var roles = await _userManager.GetRolesAsync(user);

                return Ok(new LoggedInDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user, roles as List<string>),
                    Roles = await _userManager.GetRolesAsync(user)
                });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
        }

        [HttpPost("ActivateAccount")]
        [Authorize(Policy = "AccountActivation")]
        public async Task<IActionResult> ActivateAccount([FromHeader] string Authorization)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var authToken = tokenHandler.ReadToken(Authorization.Replace("Bearer ", string.Empty)) as JwtSecurityToken;

                var email = authToken?.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Email)?.Value ?? string.Empty;

                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest("Token does not contain email");
                }

                var user = await _userManager.FindByEmailAsync(email);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                var emailConfirmationToken = authToken?.Claims.FirstOrDefault(claim => claim.Type == "AccountActivation")?.Value;

                if (string.IsNullOrEmpty(emailConfirmationToken))
                {
                    return BadRequest("Invalid email confirmation token");
                }

                var result = await _userManager.ConfirmEmailAsync(user, emailConfirmationToken);

                if (result.Succeeded)
                {
                    return Ok();
                }

                return BadRequest(result.Errors);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
        }
    }
}
