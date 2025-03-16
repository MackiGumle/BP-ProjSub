using System.Security.Claims;
using System.Text;
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
using Newtonsoft.Json;


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
        private readonly ResourceAccessService _resourceAccessService;
        private readonly IHostEnvironment _env;

        public TeacherController(
            UserManager<Person> userManager, BakalarkaDbContext dbContext,
            SubjectService subjectService, EmailService emailService,
            AccountService accountService, TokenService tokenService,
            ResourceAccessService resourceAccessService, IHostEnvironment env)
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _subjectService = subjectService;
            _emailService = emailService;
            _accountService = accountService;
            _tokenService = tokenService;
            _resourceAccessService = resourceAccessService;
            _env = env;
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


                Subject? subject;
                List<Person> newUsers = new List<Person>();
                // Create subject and students in a transaction
                using (var transaction = await _dbContext.Database.BeginTransactionAsync())
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

                            subject = await _subjectService.CreateSubjectAsync(newSubject, personId);
                            await _dbContext.SaveChangesAsync();

                            // Student IDs to be added into the subject
                            var studentLoginsToAdd = existingStudents.Select(s => s.Person.UserName!).ToList();
                            studentLoginsToAdd.AddRange(users.Select(u => u.UserName!));

                            await _subjectService.AddStudentsToSubjectAsync(subject, studentLoginsToAdd);
                            await _dbContext.SaveChangesAsync();
                        }
                        else
                        {
                            subject = await _subjectService.CreateSubjectAsync(newSubject, personId);
                            await _dbContext.SaveChangesAsync();
                        }
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
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
                        var response = await _emailService.SendAccountActivationAsync(user.Email, token);
                    }
                }

                return Ok(new SubjectDto
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Description = subject.Description
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
        public async Task<IActionResult> AddStudentsToSubject([FromBody] StudentLoginsAndSubjectDto model)
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

            int studentCount;
            int createdStudentsCount;
            try
            {
                using (var transaction = await _dbContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        var subject = await _dbContext.Subjects
                            .Include(s => s.Teachers)
                            .Include(s => s.Students)
                            .FirstOrDefaultAsync(s => s.Id == model.SubjectId);

                        if (subject == null || !subject.Teachers.Any(t => t.PersonId == personId))
                        {
                            throw new KeyNotFoundException("Subject not found.");
                        }

                        studentCount = subject.Students.Count;

                        var createdStudents = await _accountService.CreateStudentAccountsFromLoginsAsync(model.StudentLogins);
                        createdStudentsCount = createdStudents.Count;
                        // Save changes
                        await _dbContext.SaveChangesAsync();

                        var subjectRes = await _subjectService.AddStudentsToSubjectAsync(subject, model.StudentLogins);
                        studentCount = subjectRes.Students.Count - studentCount;

                        await _dbContext.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                }

                return Ok(new { message = $"{studentCount - createdStudentsCount} existing and {createdStudentsCount} created students added to subject." });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }

        }

        [HttpPost("RemoveStudentsFromSubject")]
        public async Task<IActionResult> RemoveStudentsFromSubject([FromBody] StudentLoginsAndSubjectDto model)
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

            int studentCount;

            try
            {
                using (var transaction = await _dbContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        var subject = await _dbContext.Subjects
                            .Include(s => s.Teachers)
                            .Include(s => s.Students)
                            .FirstOrDefaultAsync(s => s.Id == model.SubjectId);

                        if (subject == null || !subject.Teachers.Any(t => t.PersonId == personId))
                        {
                            throw new KeyNotFoundException("Subject not found.");
                        }

                        studentCount = subject.Students.Count;

                        var subjectRes = await _subjectService.RemoveStudentsFromSubjectAsync(model.SubjectId, model.StudentLogins);
                        studentCount = studentCount - subjectRes.Students.Count;

                        await _dbContext.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                }

                return Ok(new { message = $"{studentCount} Students removed from subject." });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = e.Message });
            }
        }

        [HttpGet("GetSubjectTudents/{subjectId}")]
        public async Task<IActionResult> GetSubjectStudents(int subjectId)
        {
            try
            {
                if (subjectId < 0)
                {
                    return BadRequest(new { message = "Invalid subject ID" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var teacherSubjects = await _dbContext.Teachers
                    .Include(t => t.SubjectsTaught)
                    .ThenInclude(s => s.Students)
                    .ThenInclude(s => s.Person)
                    .FirstOrDefaultAsync(t => t.PersonId == userId && t.SubjectsTaught.Any(s => s.Id == subjectId));

                if (teacherSubjects == null)
                {
                    return NotFound(new { message = "Subject not found." });
                }

                var subject = teacherSubjects.SubjectsTaught.First(s => s.Id == subjectId);

                var students = subject.Students.Select(s => new StudentDto
                {
                    PersonId = s.PersonId,
                    UserName = s.Person.UserName!,
                    Email = s.Person.Email
                }).ToList();

                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
                });
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
                    return NotFound(new { message = ex.Message });
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

        [HttpPut("EditAssignment")]
        public async Task<IActionResult> EditAssignment([FromBody] EditAssignmentDto model)
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

                var access = await _resourceAccessService.CanAccessAssignmentAsync(personId, model.Id, "Teacher");
                if (!access)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var assignment = await _dbContext.Assignments
                    .FirstOrDefaultAsync(a => a.Id == model.Id);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                assignment.Type = model.Type;
                assignment.Title = model.Title;
                assignment.Description = model.Description;
                assignment.DateAssigned = model.DateAssigned;
                assignment.DueDate = model.DueDate;
                assignment.MaxPoints = model.MaxPoints;

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
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPost("CreateAssignment")]
        public async Task<IActionResult> CreateAssignment([FromForm] CreateAssignmentDto model)
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

                var access = await _resourceAccessService.CanAccessSubjectAsync(personId, model.SubjectId, "Teacher");
                if (!access)
                {
                    return NotFound(new { message = "Subject not found." });
                }

                var assignment = new Assignment
                {
                    Type = model.Type,
                    Title = model.Title,
                    Description = model.Description,
                    DateAssigned = model.DateAssigned ?? DateTime.UtcNow,
                    DueDate = model.DueDate,
                    MaxPoints = model.MaxPoints,
                    SubjectId = model.SubjectId,
                    PersonId = personId
                };

                await _dbContext.Assignments.AddAsync(assignment);
                await _dbContext.SaveChangesAsync();

                if (model.Files != null && model.Files.Count > 0)
                {
                    var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads/assignments");
                    var assignmentDir = Path.Combine(uploadsRoot, assignment.Id.ToString());
                    Directory.CreateDirectory(assignmentDir);

                    foreach (var file in model.Files)
                    {
                        var filePath = Path.Combine(assignmentDir, file.FileName);
                        var absolutePath = Path.GetFullPath(filePath);
                        var targetPath = Path.GetFullPath(assignmentDir);

                        if (!absolutePath.StartsWith(targetPath))
                        {
                            return BadRequest(new { message = "Directory traversal detected." });
                        }

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                    }
                }

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
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete("DeleteAssignment/{assignmentId}")]
        public async Task<IActionResult> DeleteAssignment(int assignmentId)
        {
            try
            {
                if (assignmentId < 0)
                {
                    return BadRequest(new { message = "Invalid assignment ID" });
                }

                var personId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (personId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var access = await _resourceAccessService.CanAccessAssignmentAsync(personId, assignmentId, "Teacher");
                if (!access)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var assignment = await _dbContext.Assignments
                    // .Include(a => a.Submissions)
                    .FirstOrDefaultAsync(a => a.Id == assignmentId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                // if (assignment.Submissions.Count > 0)
                // {
                //     return BadRequest(new { message = "Assignment has submissions." });
                // }

                _dbContext.Assignments.Remove(assignment);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Assignment deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }


        [HttpGet("GetAssignments/{subjectId}")]
        public async Task<IActionResult> GetAssignments(int subjectId)
        {
            try
            {
                if (subjectId < 0)
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

        [HttpGet("GetAssignment/{assignmentId}")]
        public async Task<IActionResult> GetAssignment(int assignmentId)
        {
            try
            {
                if (assignmentId < 0)
                {
                    return BadRequest(new { message = "Invalid assignment ID" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var assignment = await _dbContext.Assignments
                    .Include(a => a.Teacher)
                    .FirstOrDefaultAsync(a => a.Id == assignmentId && a.Teacher.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var assignmentDto = new AssignmentDto
                {
                    Id = assignment.Id,
                    Type = assignment.Type,
                    Title = assignment.Title,
                    Description = assignment.Description,
                    DateAssigned = assignment.DateAssigned,
                    DueDate = assignment.DueDate,
                    MaxPoints = assignment.MaxPoints
                };

                return Ok(assignmentDto);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("GetSubmission/{submissionId}")]
        public async Task<IActionResult> GetSubmission(int submissionId)
        {
            try
            {
                if (submissionId < 0)
                {
                    return BadRequest(new { message = "Invalid submission ID" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var submission = await _dbContext.Submissions
                    .Include(s => s.Student.Person)
                    .Include(s => s.Ratings)
                    .FirstOrDefaultAsync(s => s.Id == submissionId);

                if (submission == null)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var access = await _resourceAccessService.CanAccessSubmissionAsync(userId, submissionId, "Teacher");

                if (!access)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var submissionDto = new PartialSubmissionDto
                {
                    Id = submission.Id,
                    SubmissionDate = submission.SubmissionDate,
                    AssignmentId = submission.AssignmentId,
                    PersonId = submission.PersonId,
                    StudentLogin = submission.Student.Person.UserName!,
                    Rating = submission.Ratings.OrderByDescending(r => r.Time).FirstOrDefault()?.Value
                };

                return Ok(submissionDto);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("GetSubmissions/{assignmentId}")]
        public async Task<IActionResult> GetSubmissions(int assignmentId)
        {
            try
            {
                if (assignmentId < 0)
                {
                    return BadRequest(new { message = "Invalid assignment ID" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                // Check if the assignment belongs to the teacher
                var assignment = await _dbContext.Assignments
                    .FirstOrDefaultAsync(a => a.Id == assignmentId && a.Teacher.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var submissions = await _dbContext.Submissions
                    .Include(s => s.Student.Person)
                    .Include(s => s.Ratings)
                    .Where(s => s.AssignmentId == assignmentId)
                    .ToListAsync();

                var latestSubmissions = submissions
                .GroupBy(s => s.PersonId)
                .Select(g =>
                {
                    // First take rated submissions, if any, take the latest.
                    var ratedSubmission = g
                        .Where(s => s.Ratings.Any())
                        .OrderByDescending(s => s.SubmissionDate)
                        .FirstOrDefault();

                    // Choose the latest submission if none are rated.
                    return ratedSubmission ?? g.OrderByDescending(s => s.SubmissionDate).First();
                })
                .Select(s => new PartialSubmissionDto
                {
                    Id = s.Id,
                    SubmissionDate = s.SubmissionDate,
                    AssignmentId = s.AssignmentId,
                    PersonId = s.PersonId,
                    StudentLogin = s.Student.Person.UserName!,
                    Rating = s.Ratings.OrderByDescending(r => r.Time).FirstOrDefault()?.Value

                })
                .OrderByDescending(s => s.SubmissionDate)
                .ToList();

                // Suspicious if there are multiple ips from the same student
                var logs = await _dbContext.AssignmentViewLogs
                    .Where(l => l.AssignmentId == assignmentId)
                    .OrderByDescending(l => l.ViewedOn)
                    .ToListAsync();

                foreach (var submission in latestSubmissions)
                {
                    var studentLogs = logs.Where(l => l.UserId == submission.PersonId).ToList();

                    submission.IsSuspicious = studentLogs.GroupBy(l => l.IpAddress).Count() > 1;

                    if (submission.IsSuspicious)
                    {
                        submission.AssignmentViewLogs = studentLogs
                        .Select(l => new AssignmentViewLogDto
                        {
                            IpAddress = l.IpAddress,
                            ViewedOn = l.ViewedOn
                        }).ToList();
                    }
                }

                return Ok(latestSubmissions);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("GetSubmissionVersionIds/{submissionId}")]
        public async Task<IActionResult> GetSubmissionVersionIds(int submissionId)
        {
            try
            {
                if (submissionId < 0)
                {
                    return BadRequest(new { message = "Invalid submission ID" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var submission = await _dbContext.Submissions
                    .Include(s => s.Student.Person)
                    .Include(s => s.Ratings)
                    .FirstOrDefaultAsync(s => s.Id == submissionId);

                if (submission == null)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var access = await _resourceAccessService.CanAccessAssignmentAsync(userId, submission.AssignmentId, "Teacher");

                if (!access)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var submissions = await _dbContext.Submissions
                    .Include(s => s.Ratings)
                    .Where(s => s.AssignmentId == submission.AssignmentId && s.PersonId == submission.PersonId)
                    .OrderByDescending(s => s.SubmissionDate)
                    .ToListAsync();

                return Ok(submissions.Select(s => s.Id).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("AddSubmissionComment")]
        public async Task<IActionResult> AddSubmissionComment([FromBody] AddSubmissionComment model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var access = await _resourceAccessService.CanAccessSubmissionAsync(userId, model.SubmissionId, "Teacher");
                if (!access)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var submission = await _dbContext.Submissions
                    .Include(s => s.Comments)
                    .FirstOrDefaultAsync(s => s.Id == model.SubmissionId);

                if (submission == null)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var comment = new SubmissionComment
                {
                    CommentDate = DateTime.UtcNow,
                    FileName = model.FileName,
                    LineCommented = model.LineCommented,
                    Comment = model.Comment,
                    PersonId = userId,
                    SubmissionId = model.SubmissionId
                };

                await _dbContext.SubmissionComment.AddAsync(comment);
                await _dbContext.SaveChangesAsync();

                return Ok(new SubmissionCommentDto
                {
                    Id = comment.Id,
                    CommentDate = comment.CommentDate,
                    FileName = comment.FileName,
                    LineCommented = comment.LineCommented,
                    Comment = comment.Comment
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

        /// <summary>
        /// Adds a rating to a submission.
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost("AddSubmissionRating")]
        public async Task<IActionResult> AddSubmissionRating([FromBody] AddSubmissionRating model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var access = await _resourceAccessService.CanAccessSubmissionAsync(userId, model.SubmissionId, "Teacher");
                if (!access)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var submission = await _dbContext.Submissions
                    .Include(s => s.Ratings)
                    .FirstOrDefaultAsync(s => s.Id == model.SubmissionId);

                if (submission == null)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var rating = new Rating
                {
                    Time = DateTime.UtcNow,
                    Value = model.Rating,
                    Note = model.Note,
                    SubmissionId = model.SubmissionId,
                    PersonId = userId
                };

                await _dbContext.Ratings.AddAsync(rating);
                await _dbContext.SaveChangesAsync();

                return Ok(new RatingDto
                {
                    Time = rating.Time,
                    Value = rating.Value,
                    Note = rating.Note
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

        [HttpGet("ExportSubmissionsRating/{assignmentId}")]
        public async Task<IActionResult> ExportSubmissionsRating(int assignmentId)
        {
            try
            {
                if (assignmentId < 0)
                {
                    return BadRequest(new { message = "Invalid assignment ID" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                var assignment = await _dbContext.Assignments
                    .Include(a => a.Teacher)
                    .FirstOrDefaultAsync(a => a.Id == assignmentId && a.Teacher.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var submissions = await _dbContext.Submissions
                    .Include(s => s.Ratings)
                    .Include(s => s.Student.Person)
                    .Where(s => s.AssignmentId == assignmentId && s.Ratings.Count > 0)
                    .ToListAsync();

                var ratings = submissions
                    .Select(s => new
                    {
                        Student = s.Student.Person.UserName,
                        Rating = s.Ratings.FirstOrDefault(r => r.Time == s.Ratings.Max(rt => rt.Time))?.Value
                    }).ToList();

                var csv = new StringBuilder();
                csv.AppendLine("Student;Rating");

                foreach (var rating in ratings)
                {
                    csv.AppendLine($"{rating.Student};{Convert.ToInt64(rating.Rating)}");
                }

                var fileName = $"ratings_{assignmentId}.csv";
                var fileBytes = Encoding.UTF8.GetBytes(csv.ToString());
                return File(fileBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

    }
}
