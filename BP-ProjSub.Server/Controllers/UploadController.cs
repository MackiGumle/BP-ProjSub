using System.Security.Claims;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Helpers;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
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
        private readonly IConfiguration _config;
        private readonly ResourceAccessService _resourceAccessService;
        private long maxFileSize = 5 * 1024 * 1024; // 5MB
        private long maxTotalSize = 20 * 1024 * 1024; // 20MB
        private List<string> allowedExtensions { get; }

        public UploadController(IWebHostEnvironment env, BakalarkaDbContext dbContext,
         IConfiguration config, ResourceAccessService resourceAccessService)
        {
            _env = env;
            _dbContext = dbContext;
            _config = config;
            _resourceAccessService = resourceAccessService;

            maxFileSize = long.Parse(_config["Uploads:MaxFileSize"]!);
            maxTotalSize = long.Parse(_config["Uploads:MaxTotalSize"]!);
            allowedExtensions = _config.GetSection("Uploads:AllowedFileExtensions").Get<List<string>>() ?? new List<string>();
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

                // Check the file sizes
                long totalSize = 0;
                foreach (var file in files)
                {
                    var extension = Path.GetExtension(file.FileName).ToLower();
                    if (!allowedExtensions.Contains("*") && !allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = $"Invalid file extension '{extension}'." });
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
                var assignment = await _dbContext.Assignments
                .Include(a => a.Subject.Students)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

                var access = await _resourceAccessService.CanAccessAssignmentAsync(userId, assignmentId, "Student");
                if (!access)
                {
                    return NotFound(new { message = "Assignment not found" });
                }

                // Save the files
                var uploadId = Guid.NewGuid().ToString();
                var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads");

                // The directory structure is: uploads/assignmentId/userId/uploadId
                var targetDir = Path.Combine(uploadsRoot, assignmentId.ToString(), userId, uploadId);

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

                    // recreate the user path for checking
                    var fullPath = targetDir;
                    foreach (var dirPart in directoryParts)
                    {
                        fullPath = Path.Combine(fullPath, dirPart);
                    }

                    fullPath = Path.Combine(fullPath, fileName);

                    // Absolute path check for directory traversal
                    var resolvedFullPath = Path.GetFullPath(fullPath);
                    var targetDirFullPath = Path.GetFullPath(targetDir);
                    if (!resolvedFullPath.StartsWith(targetDirFullPath))
                    {
                        return BadRequest(new { message = "Invalid file path due to directory traversal." });
                    }

                    Directory.CreateDirectory(targetDir);

                    var currentDir = targetDir;
                    foreach (var dirPart in directoryParts)
                    {
                        currentDir = Path.Combine(currentDir, dirPart);
                        Directory.CreateDirectory(currentDir);
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

                // If the submission is not saved to DB, delete the uploaded files
                try { await _dbContext.SaveChangesAsync(); }
                catch
                {
                    Directory.Delete(targetDir, true);
                    throw;
                }


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
                .FirstOrDefaultAsync(s => s.Id == submissionId);

                var access = await _resourceAccessService.CanAccessSubmissionAsync(userId, submissionId, User.FindFirst(ClaimTypes.Role)?.Value);
                if (!access)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads");
                var targetDir = Path.Combine(uploadsRoot, submission.FileName);

                if (!Directory.Exists(targetDir))
                {
                    return NotFound(new { message = "Submission directory not found." });
                }

                var fileTree = FileTreeNode.CreateFromPath(targetDir);

                return Ok(fileTree.Children);
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

        [HttpGet("DownloadSubmissionFile/{submissionId}/{requestedFileName}")]
        [Authorize(Roles = "Student, Teacher")]
        public async Task<IActionResult> DownloadSubmissionFile(int submissionId, string requestedFileName)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var submissionDb = await _dbContext.Submissions
                .FirstOrDefaultAsync(s => s.Id == submissionId);

                var access = await _resourceAccessService.CanAccessSubmissionAsync(userId, submissionId, User.FindFirst(ClaimTypes.Role)?.Value);
                if (!access)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads");
                var targetDir = Path.Combine(uploadsRoot, submissionDb.FileName);

                if (!Directory.Exists(targetDir))
                {
                    return NotFound(new { message = "Submission directory not found." });
                }

                var decodedFileName = System.Net.WebUtility.UrlDecode(requestedFileName);
                var filePath = Path.Combine(targetDir, decodedFileName);
                var resolvedFullPath = Path.GetFullPath(filePath);
                var targetDirFullPath = Path.GetFullPath(targetDir);
                if (!resolvedFullPath.StartsWith(targetDirFullPath))
                {
                    return BadRequest(new { message = "Invalid file path due to directory traversal." });
                }

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "File not found." });
                }

                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;

                var provider = new FileExtensionContentTypeProvider();

                if (!provider.TryGetContentType(filePath, out string contentType))
                {
                    contentType = "text/plain";
                }

                return File(memory, contentType, Path.GetFileName(filePath));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred during file download.",
                    Error = ex.Message
                });
            }
        }

    }
}
