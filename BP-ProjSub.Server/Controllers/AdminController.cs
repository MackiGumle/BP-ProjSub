using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos;
using BP_ProjSub.Server.Data.Dtos.Auth;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;

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
        private readonly AccountService _accountService;

        public AdminController(UserManager<Person> userManager, EmailService emailService, TokenService tokenService, BakalarkaDbContext dbContext, AccountService accountService)
        {
            _userManager = userManager;
            _emailService = emailService;
            _tokenService = tokenService;
            _dbContext = dbContext;
            _accountService = accountService;
        }

        [HttpPost("createAccount")]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDto model)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await _accountService.CreateAccountAsync(model);
                var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var token = _tokenService.CreateAccountActivationToken(user, emailToken);
                var response = await _emailService.SendAccountActivationAsync(user.Email, token);

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new
                {
                    message = $"Account created successfully. Email sent to {user.Email} = {response.IsSuccessStatusCode}.",
                });
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }

        [HttpGet("getAccounts")]
        public async Task<IActionResult> GetAccounts([FromQuery] string searchTerm = "")
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => u.UserName.Contains(searchTerm));
            }
            else
            {
                query = query.Take(50);
            }

            var users = await query.ToListAsync();

            var userDtos = new List<UserDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    Roles = roles.ToList(),
                    LockoutEnabled = user.LockoutEnabled,
                    LockoutEnd = user.LockoutEnd,
                });
            }

            return Ok(userDtos);
        }

        [HttpPost("lockAccount")]
        public async Task<IActionResult> LockAccount([FromBody] string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "User ID is required." });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var result = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            if (result.Succeeded)
            {
                return Ok(new { message = "Account locked successfully." });
            }

            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to lock account." });
        }

        [HttpPost("unlockAccount")]
        public async Task<IActionResult> UnlockAccount([FromBody] string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "User ID is required." });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var result = await _userManager.SetLockoutEndDateAsync(user, null);
            if (result.Succeeded)
            {
                return Ok(new { message = "Account unlocked successfully." });
            }

            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to unlock account." });
        }
    }
}
