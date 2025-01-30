using System.Security.Claims;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Helpers;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BP_ProjSub.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly BakalarkaDbContext _dbContext;
        private const long maxFileSize = 5 * 1024 * 1024; // 5MB
        private const long maxTotalSize = 20 * 1024 * 1024; // 20MB

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
        [HttpPost("UploadSubmissionFiles/{assignmentId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UploadSubmissionFiles(int assignmentId, [FromForm] List<IFormFile> files)
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
                    if (string.IsNullOrEmpty(file.FileName))
                    {
                        return BadRequest(new { message = "A file has empty filename." });
                    }

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
                .Include(a => a.Subject.Students)
                .FirstOrDefault(a => a.Id == assignmentId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                // Check if the user is a student in the subject
                if (!assignment.Subject.Students.Any(s => s.PersonId == userId))
                {
                    return NotFound(new { message = "Assignment not found" });
                }

                // Save the files
                var uploadId = Guid.NewGuid().ToString();
                var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads");

                // The directory structure is: uploads/assignmentId/userId/uploadId
                var targetDir = Path.Combine(uploadsRoot, assignmentId.ToString(), userId, uploadId);
                Directory.CreateDirectory(targetDir);

                // Check for directory traversal
                foreach (var file in files)
                {
                    var fileNameParts = file.FileName.Split('/', StringSplitOptions.RemoveEmptyEntries);
                    if (fileNameParts.Length == 0)
                    {
                        return BadRequest(new { message = "Empty filename." });
                    }

                    var fileName = fileNameParts.Last();
                    var directoryParts = fileNameParts.Take(fileNameParts.Length - 1).ToArray();

                    foreach (var part in directoryParts)
                    {
                        if (part == "." || part == "..")
                        {
                            return BadRequest(new { message = "Directory traversal in filename." });
                        }
                        if (part.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
                        {
                            return BadRequest(new { message = $"Invalid characters in directory name '{part}'." });
                        }
                    }

                    if (fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
                    {
                        return BadRequest(new { message = $"Invalid characters in filename '{fileName}'." });
                    }

                    var currentDir = targetDir;
                    foreach (var dirPart in directoryParts)
                    {
                        currentDir = Path.Combine(currentDir, dirPart);
                        Directory.CreateDirectory(currentDir);
                    }

                    // To be sure the path is not a directory traversal
                    var fullPath = Path.Combine(currentDir, fileName);
                    var resolvedFullPath = Path.GetFullPath(fullPath);
                    var targetDirFullPath = Path.GetFullPath(targetDir);
                    if (!resolvedFullPath.StartsWith(targetDirFullPath))
                    {
                        return BadRequest(new { message = "Invalid file path due to directory traversal." });
                    }

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

        [HttpGet("GetSubmissionFileTree/{submissionId}")]
        [Authorize(Roles = "Student, Teacher")]
        public async Task<IActionResult> GetSubmissionFileTree(int submissionId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var submission = await _dbContext.Submissions
                .Include(s => s.Assignment.Teacher)
                .FirstOrDefaultAsync(s => s.Id == submissionId);

                if (submission == null)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                // Check if the student is the owner of the submission
                if (submission.PersonId != userId && User.IsInRole("Student"))
                {
                    return Unauthorized(new { message = "User is not the owner of the submission." });
                }

                // Check if the teacher is the owner of the assignment
                if (submission.Assignment.Teacher.PersonId != userId && User.IsInRole("Teacher"))
                {
                    return Unauthorized(new { message = "Teacher is not the owner of the assignment." });
                }

                var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads");
                var targetDir = Path.Combine(uploadsRoot, submission.FileName);

                if (!Directory.Exists(targetDir))
                {
                    return NotFound(new { message = "Submission directory not found." });
                }

                var fileTree = new FileTreeNode(submission.FileName);
                var rootDir = new DirectoryInfo(targetDir);
                var stack = new Stack<(DirectoryInfo, FileTreeNode)>(); // (Directory, ParentNode)

                stack.Push((rootDir, fileTree));

                while (stack.Count > 0)
                {
                    var (currentDir, parentNode) = stack.Pop();
                    var subDirs = currentDir.GetDirectories();
                    foreach (var subDir in subDirs)
                    {
                        var subDirNode = new FileTreeNode(subDir.Name);
                        parentNode.AddChild(subDirNode);
                        stack.Push((subDir, subDirNode));
                    }

                    var files = currentDir.GetFiles();
                    foreach (var file in files)
                    {
                        parentNode.AddChild(new FileTreeNode(file.Name));
                    }
                }

                return Ok(fileTree);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred during file tree reconstruction.",
                    Error = ex.Message
                });
            }
        }

       
    }
}
