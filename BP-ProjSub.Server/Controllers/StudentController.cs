using System.Security.Claims;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly BakalarkaDbContext _dbContext;
        private readonly SubjectService _subjectService;
        private readonly ResourceAccessService _resourceAccessService;

        public StudentController(IWebHostEnvironment env, BakalarkaDbContext dbContext,
         SubjectService subjectService, ResourceAccessService resourceAccessService)
        {
            _env = env;
            _dbContext = dbContext;
            _subjectService = subjectService;
            _resourceAccessService = resourceAccessService;
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
                    subjects = await _subjectService.GetSubjectsByPersonIdAsync(personId, "Student");
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

        // TODO: Create service for Assignments and check if the student should be able to see the assignments
        [HttpGet("GetAssignments/{subjectId}")]
        public async Task<IActionResult> GetAssignments(int subjectId)
        {
            try
            {
                if (subjectId <= 0)
                {
                    return BadRequest(new { message = "Invalid subject ID" });
                }

                var assignments = await _dbContext.Assignments
                    .Where(a => a.SubjectId == subjectId && a.DateAssigned <= DateTime.UtcNow)
                    .OrderBy(a => a.DueDate)
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

                var access = await _resourceAccessService.CanAccessAssignmentAsync(userId, assignmentId, "Student");
                if (!access)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var assignment = await _dbContext.Assignments
                    .FirstOrDefaultAsync(a => a.Id == assignmentId);
                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                if (assignment.Type == "Test" && assignment.DueDate > DateTime.UtcNow)
                {
                    var assignmentViewLog = new AssignmentViewLog
                    {
                        AssignmentId = assignmentId,
                        UserId = userId,
                        IpAddress = Request.HttpContext.Connection.RemoteIpAddress?.ToString(),
                        ViewedOn = DateTime.UtcNow
                    };

                    _dbContext.AssignmentViewLogs.Add(assignmentViewLog);
                    await _dbContext.SaveChangesAsync();
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

                var access = await _resourceAccessService.CanAccessAssignmentAsync(userId, assignmentId, "Student");
                if (!access)
                {
                    return NotFound(new { message = "Assignment not found" });
                }

                var submissions = await _dbContext.Submissions
                    .Include(s => s.Ratings)
                    .Where(s => s.AssignmentId == assignmentId && s.PersonId == userId)
                    .ToListAsync();

                if (submissions.Count == 0)
                {
                    return Ok();
                }

                var latestSubmission = submissions.OrderByDescending(s => s.SubmissionDate).FirstOrDefault();

                return Ok(new PartialSubmissionDto
                {
                    Id = latestSubmission.Id,
                    SubmissionDate = latestSubmission.SubmissionDate,
                    AssignmentId = latestSubmission.AssignmentId,
                    PersonId = latestSubmission.PersonId,
                    Rating = latestSubmission.Ratings.OrderByDescending(r => r.Time).FirstOrDefault()?.Value,
                }
                );
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
                    .Include(s => s.Ratings)
                    .FirstOrDefaultAsync(s => s.Id == submissionId);

                if (submission == null)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var access = await _resourceAccessService.CanAccessSubmissionAsync(userId, submissionId, "Student");

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

                var access = await _resourceAccessService.CanAccessAssignmentAsync(userId, submission.AssignmentId, "Student");

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
    }
}
