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

        public TestingController(AccountService accountService, UserManager<Person> userManager, ILogger<TestingController> logger
            , BakalarkaDbContext dbContext)
        {
            _logger = logger;
            _userManager = userManager;
            _accountService = accountService;
            _dbContext = dbContext;
        }

        [HttpGet("CreateRandomStudentAccount")]
        public async Task<IActionResult> CreateRandomStudentAccount()
        {
            try
            {
                int random = Random.Shared.Next(1000, 9999);
                var model = new CreateAccountDto
                {
                    UserName = "Stu" + random,
                    Email = "stu" + random + "@example.com",
                    Role = "Student"
                };

                var user = await _accountService.CreateAccountAsync(model);

                var passwordResult = await _userManager.AddPasswordAsync(user, "P@ssw0rd");
                if (!passwordResult.Succeeded)
                {
                    return BadRequest(new { message = "Password could not be set." });
                }

                return Ok();
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
                    UserName = "Tea" + random,
                    Email = "tea" + random + "@example.com",
                    Role = "Teacher"
                };

                var user = await _accountService.CreateAccountAsync(model);

                var passwordResult = await _userManager.AddPasswordAsync(user, "P@ssw0rd");
                if (!passwordResult.Succeeded)
                {
                    return BadRequest(new { message = "Password could not be set." });
                }

                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }

    }
}
