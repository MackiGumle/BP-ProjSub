using System.Security.Claims;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly BakalarkaDbContext _dbContext;
        const long maxFileSize = 5 * 1024 * 1024; // 5MB
        const long maxTotalSize = 20 * 1024 * 1024; // 20MB

        public UploadController(IWebHostEnvironment env, BakalarkaDbContext dbContext)
        {
            _env = env;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Uploads files for a given assignment.
        /// Path: _env.ContentRootPath/uploads/assignmentId/userId/uploadId
        /// DB saves relative path: assignmentId/userId/uploadId
        /// </summary>
        /// <param name="assignmentId"></param>
        /// <param name="files"></param>
        /// <returns></returns>
        [HttpPost("{assignmentId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UploadFiles(int assignmentId, [FromForm] List<IFormFile> files)
        {
            try
            {
                // Get the user ID from the token
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                // Check if files were received
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { message = "No files received from the upload." });
                }

                // Check file sizes
                long totalSize = 0;
                foreach (var file in files)
                {
                    if (file.Length > maxFileSize)
                    {
                        return BadRequest(new { message = $"File {file.FileName} exceeds the maximum filesize of {maxFileSize} bytes." });
                    }

                    totalSize += file.Length;
                    if (totalSize > maxTotalSize)
                    {
                        return BadRequest(new { message = $"Total size of all files exceeds the maximum total size of {maxTotalSize} bytes." });
                    }
                }

                // Get the assignment
                var assignment = _dbContext.Assignments
                .Include(a => a.Subject)
                .Include(a => a.Subject.Students)
                .FirstOrDefault(a => a.Id == assignmentId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var subject = assignment.Subject;
                if (!subject.Students.Any(s => s.PersonId == userId))
                {
                    return Unauthorized(new { message = "User is not a student in the subject." });
                }

                // Save the files
                var uploadId = Guid.NewGuid().ToString();
                var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads");

                // The directory structure is: uploads/assignmentId/userId/uploadId
                var targetDir = Path.Combine(uploadsRoot, assignmentId.ToString(), userId, uploadId);
                Directory.CreateDirectory(targetDir);


                // var savedFiles = new List<object>();
                foreach (var file in files)
                {
                    // TODO: Make filename actually safe
                    var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

                    var fullPath = Path.Combine(targetDir, safeFileName);

                    // Save the file
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }

                var relativePath = Path.Combine(assignmentId.ToString(), userId, uploadId);

                var submission = await _dbContext.Submissions.AddAsync(new Submission
                {
                    SubmissionDate = DateTime.Now,
                    FileName = relativePath,
                    AssignmentId = assignmentId,
                    FileData = new byte[1], // TODO: remove this field from db
                    PersonId = userId,
                });

                // Save the submission, if it fails, deleting the files would be great
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Files uploaded successfully.",
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred during file upload.",
                    Error = ex.Message
                });
            }
        }
    }
}
