using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BP_ProjSub.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly BakalarkaDbContext _dbContext;
        private readonly UserManager<Person> _userManager;
        private readonly EmailService _emailService;
        private readonly TokenService _tokenService;

        public AdminController(UserManager<Person> userManager, EmailService emailService, TokenService tokenService, BakalarkaDbContext dbContext)
        {
            _userManager = userManager;
            _emailService = emailService;
            _tokenService = tokenService;
            _dbContext = dbContext;
        }

        [HttpPost("createAccount")]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDto model)
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

                // Check if user already exists and is confirmed
                var userFromDB = await _userManager.FindByEmailAsync(model.Email);
                if (userFromDB != null && userFromDB.EmailConfirmed)
                {
                    return BadRequest($"User with email '{model.Email}' already exists.");
                }

                if(userFromDB != null)
                {
                    user = userFromDB;
                }

                // Create user
                if(userFromDB == null)
                {
                    var result = await _userManager.CreateAsync(user);
                    if (result.Succeeded)
                    {
                        var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
                        if (!roleResult.Succeeded)
                        {
                            return BadRequest(roleResult.Errors);
                        }

                        return Ok();
                    }

                    return BadRequest(result.Errors);
                }

                // Send email with account activation token
                var emailConfirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var authToken = _tokenService.CreateAccountActivationToken(user, emailConfirmationToken);

                var emailResult = await _emailService.SendAccountActivation(user.Email, authToken);
                if (!emailResult.IsSuccessStatusCode)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "Failed to send activation email.");
                }

                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
        }
    }
}
