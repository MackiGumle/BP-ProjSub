using System.Security.Claims;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos;
using BP_ProjSub.Server.Data.Dtos.Teacher;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Teacher")]
    public class TeacherController : ControllerBase
    {
        private readonly UserManager<Person> _userManager;
        private readonly BakalarkaDbContext _dbContext;
        private readonly SubjectService _subjectService;

        public TeacherController(UserManager<Person> userManager, BakalarkaDbContext dbContext, SubjectService subjectService)
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _subjectService = subjectService;
        }

        [HttpPost("CreateSubject")]
        public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = ModelState.ToString() });
                }

                var personId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (personId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                Subject newSubject;
                try
                {
                    newSubject = await _subjectService.CreateSubjectAsync(model, personId);
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = $"Failed to create subject: {ex.Message}" });
                }

                return Ok(new SubjectDto
                {
                    Id = newSubject.Id,
                    Name = newSubject.Name,
                    Description = newSubject.Description
                });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }

        [HttpGet("GetSubjects")]
        public async Task<IActionResult> GetSubjects()
        {
            try
            {
                var personId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (personId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                List<Subject> subjects;
                try
                {
                    subjects = await _subjectService.GetSubjectsByPersonIdAsync(personId, "Teacher");
                }
                catch (KeyNotFoundException ex)
                {
                    return Unauthorized(new { message = ex.Message });
                }

                List<SubjectDto> subjectDtos = subjects.Select(s => new SubjectDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description
                }).ToList();

                return Ok(subjectDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("EditSubject")]
        public async Task<IActionResult> EditSubject([FromBody] SubjectDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var personId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (personId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                Subject subject;
                try
                {
                    subject = await _subjectService.EditSubjectAsync(model, personId);
                }
                catch (KeyNotFoundException ex)
                {
                    return Unauthorized(new { message = ex.Message });
                }

                return Ok(new SubjectDto
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Description = subject.Description
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message =  ex.Message
                });
            }
        }

        [HttpGet("GetAssignments")]
        public async Task<IActionResult> GetAssignments([FromQuery] int subjectId)
        {
            try
            {
                if (subjectId <= 0)
                {
                    return BadRequest(new { message = "Invalid subject ID" });
                }

                var assignments = await _dbContext.Assignments
                    .Where(a => a.SubjectId == subjectId)
                    .Include(a => a.Teacher)
                    .Select(a => new AssignmentDto
                    {
                        Id = a.Id,
                        Type = a.Type,
                        Title = a.Title,
                        DateAssigned = a.DateAssigned,
                        DueDate = a.DueDate,
                        MaxPoints = a.MaxPoints
                    })
                    .ToListAsync();

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("createStudent")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto model)
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

                var result = await _userManager.CreateAsync(user);

                if (result.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, "Student");

                    return Ok();
                }

                return BadRequest(result.Errors);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }
    }
}
