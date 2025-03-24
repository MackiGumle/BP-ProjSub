using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos.Auth;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BP_ProjSub.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestingController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };
        private readonly ILogger<TestingController> _logger;
        private readonly UserManager<Person> _userManager;
        private readonly AccountService _accountService;
        private readonly BakalarkaDbContext _dbContext;
        private readonly EmailService _emailService;

        public TestingController(AccountService accountService, UserManager<Person> userManager,
         ILogger<TestingController> logger, BakalarkaDbContext dbContext,
         EmailService emailService)
        {
            _logger = logger;
            _userManager = userManager;
            _accountService = accountService;
            _dbContext = dbContext;
            _emailService = emailService;
        }

        [HttpGet("CreateRandomStudentAccount")]
        public async Task<IActionResult> CreateRandomStudentAccount()
        {
            try
            {
                int random = Random.Shared.Next(1000, 9999);
                var model = new CreateAccountDto
                {
                    UserName = "sss" + random,
                    Email = "sss" + random + "@example.com",
                    Role = "Student"
                };

                var user = await _accountService.CreateAccountAsync(model);

                var passwordResult = await _userManager.AddPasswordAsync(user, "P@ssw0rd");
                if (!passwordResult.Succeeded)
                {
                    return BadRequest(new { message = "Password could not be set." });
                }

                var verifyEmailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                await _userManager.ConfirmEmailAsync(user, verifyEmailToken);

                return Ok(
                    new
                    {
                        user.Id,
                        user.UserName,
                        user.Email,
                        password = "P@ssw0rd"
                    });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }

        [HttpGet("CreateRandomTeacherAccount")]
        public async Task<IActionResult> CreateRandomTeacherAccount()
        {
            try
            {
                int random = Random.Shared.Next(1000, 9999);
                var model = new CreateAccountDto
                {
                    UserName = "ttt" + random,
                    Email = "ttt" + random + "@example.com",
                    Role = "Teacher"
                };

                var user = await _accountService.CreateAccountAsync(model);

                var passwordResult = await _userManager.AddPasswordAsync(user, "P@ssw0rd");
                if (!passwordResult.Succeeded)
                {
                    return BadRequest(new { message = "Password could not be set." });
                }

                var verifyEmailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                await _userManager.ConfirmEmailAsync(user, verifyEmailToken);

                return Ok(
                    new
                    {
                        user.Id,
                        user.UserName,
                        user.Email,
                        password = "P@ssw0rd"
                    }
                );
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }

        [HttpGet("ConsoleLog")]
        public async Task<IActionResult> ConsoleLog()
        {
            Console.WriteLine("Console log test");
            return Ok(new { message = new string[] { "Console log test", "Console log test" } });
        }

        [HttpGet("SendEmail")]
        public async Task<IActionResult> SendEmail()
        {
            try
            {
                var res = await _emailService.SendAccountActivationAsync("masterik676@gmail.com", "token");
                if (!res.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "Email could not be sent." });
                }

                return Ok(new { message = "Email sent" });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }
    }
}
