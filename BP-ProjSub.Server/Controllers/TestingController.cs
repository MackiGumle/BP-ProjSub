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

        public TestingController(AccountService accountService, UserManager<Person> userManager, ILogger<TestingController> logger)
        {
            _logger = logger;
            _userManager = userManager;
            _accountService = accountService;
        }

        [HttpGet("CreateRandomStudentAccount")]
        public async Task<IActionResult> CreateRandomStudentAccount()
        {
            try
            {
                var model = new CreateAccountDto
                {
                    UserName = "Stu" + Random.Shared.Next(1000, 9999),
                    Email = "stu" + Random.Shared.Next(1000, 9999) + "@example.com",
                    Role = "Student"
                };

                var user = await _accountService.CreateAccountAsync(model);
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new {message = e.Message});
            }
        }

        [HttpGet("CreateRandomTeacherAccount")]
        public async Task<IActionResult> CreateRandomTeacherAccount()
        {
            try
            {
                var model = new CreateAccountDto
                {
                    UserName = "Tea" + Random.Shared.Next(1000, 9999),
                    Email = "tea" + Random.Shared.Next(1000, 9999) + "@example.com",
                    Role = "Teacher"
                };

                var user = await _accountService.CreateAccountAsync(model);
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new {message = e.Message});
            }
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }
}
