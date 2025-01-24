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
                    return BadRequest(new {message = ModelState.ToString()});
                }
                
                var emailClaim = User.FindFirst(ClaimTypes.Email);
                if (emailClaim == null)
                {
                    return Unauthorized(new { message = "Email claim not found in token." });
                }

                var user = await _userManager.FindByEmailAsync(emailClaim.Value);
                if (user == null)
                {
                    return BadRequest(new { message = "User not found." });
                }

                var teacher = await _dbContext.Teachers
                    .Include(t => t.Person)
                    .FirstOrDefaultAsync(t => t.PersonId == user.Id);
                
                if (teacher == null)
                {
                    return BadRequest(new { message = "Only teachers can create subjects." });
                }

                var newSubject = await _subjectService.CreateSubjectAsync(model.Name, model.Description, teacher.PersonId);
                if(newSubject == null)
                {
                    return BadRequest(new { message = "Failed to create subject." });
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
                return StatusCode(StatusCodes.Status500InternalServerError, new {message = e.Message});
            }
        }

        [HttpGet("GetSubjects")]
        public async Task<IActionResult> GetSubjects()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var subjects = await _dbContext.Subjects
                    .Include(s => s.Teachers)
                    .Where(s => s.Teachers.Any(t => t.PersonId == userId))
                    .ToListAsync();

                if (subjects == null)
                {
                    return BadRequest(new { message = "No subjects found." });
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
                    message = "Error retrieving subjects",
                    error = ex.Message
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
                return StatusCode(StatusCodes.Status500InternalServerError, new {message = e.Message});
            }
        }
    }
}
