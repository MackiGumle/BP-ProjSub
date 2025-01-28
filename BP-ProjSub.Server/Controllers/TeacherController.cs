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
using Microsoft.EntityFrameworkCore.Metadata.Internal;


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
        private readonly EmailService _emailService;
        private readonly AccountService _accountService;
        private readonly TokenService _tokenService;

        public TeacherController(
            UserManager<Person> userManager, BakalarkaDbContext dbContext,
            SubjectService subjectService, EmailService emailService,
            AccountService accountService, TokenService tokenService)
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _subjectService = subjectService;
            _emailService = emailService;
            _accountService = accountService;
            _tokenService = tokenService;
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

                var newSubject = new Subject
                {
                    Name = model.Name,
                    Description = model.Description
                };


                List<Person> newUsers = new List<Person>();
                // Create subject and students in a transaction
                using (var transaction = _dbContext.Database.BeginTransaction())
                {
                    try
                    {
                        if (model.StudentLogins != null)
                        {
                            var studentLogins = model.StudentLogins.Distinct().ToList();

                            var existingStudents = _dbContext.Students
                            .Include(s => s.Person)
                            .Where(s => studentLogins.Contains(s.Person.UserName!))
                            .ToList();

                            var users = await _accountService.CreateStudentAccountsFromLoginsAsync(model.StudentLogins);
                            await _dbContext.SaveChangesAsync();

                            // We need to send activation email to them
                            newUsers.AddRange(users);

                            var subject = await _subjectService.CreateSubjectAsync(newSubject, personId);
                            await _dbContext.SaveChangesAsync();

                            // Student IDs to be added into the subject
                            var studentLoginsToAdd = existingStudents.Select(s => s.Person.UserName!).ToList();
                            studentLoginsToAdd.AddRange(users.Select(u => u.UserName!));

                            await _subjectService.AddStudentsToSubjectAsync(subject, studentLoginsToAdd);
                            await _dbContext.SaveChangesAsync();

                        }
                        else
                        {
                            var subject = await _subjectService.CreateSubjectAsync(newSubject, personId);
                            await _dbContext.SaveChangesAsync();
                        }
                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }

                // Send activation emails to new students
                if (newUsers.Count > 0)
                {
                    foreach (var user in newUsers)
                    {
                        var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                        var token = _tokenService.CreateAccountActivationToken(user, emailToken);
                        var response = await _emailService.SendAccountActivation(user.Email, token);
                    }
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


        /// <summary>
        /// Adds students to a subject. <br/>
        /// If a student is already in the subject, they are not added again. <br/>
        /// If a student is not found, they are ignored. <br/>
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost("AddStudentsToSubject")]
        public async Task<IActionResult> AddStudentsToSubject([FromBody] AddStudentsToSubjectDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = ModelState.ToString() });
            }

            int studentCount;

            try
            {
                using (var transaction = _dbContext.Database.BeginTransaction())
                {
                    try
                    {
                        var subject = await _dbContext.Subjects
                            .FirstOrDefaultAsync(s => s.Id == model.SubjectId);

                        if (subject == null)
                        {
                            throw new KeyNotFoundException("Subject not found.");
                        }

                        var subjectRes = await _subjectService.AddStudentsToSubjectAsync(subject, model.StudentLogins);
                        studentCount = subjectRes.Students.Count;

                        await _dbContext.SaveChangesAsync();
                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }

                return Ok(new { message = $"{studentCount} Students added to subject." });
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
                    message = ex.Message
                });
            }
        }

        [HttpPost("CreateAssignment")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto model)
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

                var subjectExists = await _dbContext.Subjects.AnyAsync(s => s.Id == model.SubjectId);
                if (!subjectExists)
                {
                    return BadRequest(new { message = $"Invalid SubjectId {model.SubjectId}. Subject does not exist." });
                }

                var assignment = new Assignment
                {
                    Type = model.Type,
                    Title = model.Title,
                    Description = model.Description,
                    DateAssigned = DateTime.Now,
                    DueDate = model.DueDate,
                    MaxPoints = model.MaxPoints,
                    SubjectId = model.SubjectId,
                    PersonId = personId
                };

                await _dbContext.Assignments.AddAsync(assignment);
                await _dbContext.SaveChangesAsync();

                return Ok(new AssignmentDto
                {
                    Id = assignment.Id,
                    Type = assignment.Type,
                    Title = assignment.Title,
                    Description = assignment.Description,
                    DateAssigned = assignment.DateAssigned,
                    DueDate = assignment.DueDate,
                    MaxPoints = assignment.MaxPoints
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
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

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var assignments = await _dbContext.Assignments
                    .Include(a => a.Teacher)
                    .Where(a => a.SubjectId == subjectId && a.Teacher.PersonId == userId)
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
