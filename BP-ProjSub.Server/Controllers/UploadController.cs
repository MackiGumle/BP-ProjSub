using System.Diagnostics;
using System.IO.Compression;
using System.Security.Claims;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos;
using BP_ProjSub.Server.Data.Dtos.Teacher;
using BP_ProjSub.Server.Helpers;
using BP_ProjSub.Server.Models;
using BP_ProjSub.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using MimeTypes;

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
        private readonly BlobServiceClient _blobServiceClient;
        private long maxFileSize = 5 * 1024 * 1024; // 5MB
        private long maxTotalSize = 20 * 1024 * 1024; // 20MB
        private int maxFiles = 50; // Max number of files per upload
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
            maxFiles = int.Parse(_config["Uploads:MaxFiles"]!);
            allowedExtensions = _config.GetSection("Uploads:AllowedFileExtensions").Get<List<string>>() ?? new List<string>();
            _blobServiceClient = new BlobServiceClient(_config["ConnectionStrings:BakalarkaBlob"]);
        }

        /// <summary>
        /// Uploads files for a given assignment.
        /// Files are uploaded to Azure Blob Storage into a container using a virtual folder structure:
        /// "assignmentId/userId/uploadId/..."
        /// The relative path is saved to the database.
        /// </summary>
        /// <param name="assignmentId"></param>
        /// <param name="files">The files to upload.</param>
        /// <returns></returns>
        [HttpPost("UploadSubmissionFiles/{assignmentId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UploadSubmissionFiles(int assignmentId, [FromForm] List<IFormFile> files)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                if (userName == null)
                {
                    return Unauthorized(new { message = "User login not found in token." });
                }

                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { message = "No files received from the upload." });
                }

                var fileCount = files.Count;
                if (fileCount > maxFiles)
                {
                    return BadRequest(new { message = $"Maximum number of files exceeded. Max files: {maxFiles}." });
                }

                var access = await _resourceAccessService.CanAccessAssignmentAsync(userId, assignmentId, "Student");
                if (!access)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                // Validate file extensions and sizes
                long totalSize = 0;
                foreach (var file in files)
                {
                    var extension = Path.GetExtension(file.FileName).ToLower();

                    if (FileValidationHelper.ValidateFileExtension(extension, allowedExtensions))
                    {
                        return BadRequest(new { message = $"Invalid file extension '{extension}'." });
                    }

                    if (file.Length > maxFileSize)
                    {
                        return BadRequest(new { message = $"File {file.FileName} exceeds the maximum filesize of {maxFileSize} bytes." });
                    }

                    if (extension == ".zip")
                    {
                        // TODO: validate ValidateZipFileSize 
                    }
                    else
                    {
                        totalSize += file.Length;
                    }


                    if (totalSize > maxTotalSize)
                    {
                        return BadRequest(new { message = $"Total size of all files exceeds the maximum total size of {maxTotalSize} bytes." });
                    }
                }

                // Check if student is in the subject
                var assignment = await _dbContext.Assignments
                    .Include(a => a.Subject.Students)
                    .FirstOrDefaultAsync(a => a.Id == assignmentId && a.Subject.Students.Any(s => s.PersonId == userId));

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found" });
                }

                // var uploadId = Guid.NewGuid().ToString();
                var uploadId = DateTime.UtcNow.ToString("dd_MM_yyyy_HH_mm_ss");

                var containerClient = _blobServiceClient.GetBlobContainerClient("submissions");
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

                string blobName = string.Empty;

                // Upload each file
                foreach (var file in files)
                {
                    var extension = Path.GetExtension(file.FileName).ToLower();
                    // If the file is a zip archive, unzip and process its entries.
                    if (extension == ".zip")
                    {
                        // Use the zip filename (without extension) as the folder name
                        var zipFolderName = Path.GetFileNameWithoutExtension(file.FileName);

                        using (var zipStream = file.OpenReadStream())
                        using (var archive = new ZipArchive(zipStream))
                        {
                            foreach (var entry in archive.Entries)
                            {
                                // Skip directories (entries with empty names)
                                if (string.IsNullOrEmpty(entry.Name))
                                {
                                    continue;
                                }

                                // Split the entry path to preserve any folder structure inside the zip
                                var entryPathParts = entry.FullName.Split(['/', '\\'], StringSplitOptions.RemoveEmptyEntries);
                                // Validate each part to avoid directory traversal
                                foreach (var part in entryPathParts)
                                {
                                    if (part == "." || part == "..")
                                    {
                                        return BadRequest(new { message = "Invalid file path in zip due to directory traversal." });
                                    }
                                    if (part.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
                                    {
                                        return BadRequest(new { message = $"Invalid characters in directory name '{part}' in zip file." });
                                    }
                                }
                                var fileName = entryPathParts.Last();
                                if (fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
                                {
                                    return BadRequest(new { message = $"Invalid characters in filename '{fileName}' in zip file." });
                                }

                                // Construct the blob name:
                                // assignmentId/userName/uploadId/zipFolderName/[subfolders]/filename
                                blobName = $"{assignmentId}/{userName}/{uploadId}/{zipFolderName}";
                                if (entryPathParts.Length > 1)
                                {
                                    // Include any subfolders from the zip entry (excluding the file name)
                                    var subFolders = entryPathParts.Take(entryPathParts.Length - 1);
                                    blobName += "/" + string.Join("/", subFolders);
                                }
                                blobName += "/" + fileName;

                                // (Optional) Validate that the resolved full path is inside the intended folder
                                var targetDir = $"{assignmentId}/{userName}/{uploadId}/{zipFolderName}";
                                var resolvedFullPath = Path.GetFullPath(blobName);
                                var targetDirFullPath = Path.GetFullPath(targetDir);
                                if (!resolvedFullPath.StartsWith(targetDirFullPath))
                                {
                                    return BadRequest(new { message = "Invalid file path in zip due to directory traversal." });
                                }

                                // Upload the file entry to blob storage
                                var blobClient = containerClient.GetBlobClient(blobName);
                                var blobHttpHeaders = new BlobHttpHeaders
                                {
                                    // https://github.com/samuelneff/MimeTypeMap
                                    ContentType = MimeTypeMap.GetMimeType(fileName)
                                };

                                // Open the entry stream and upload
                                using (var entryStream = entry.Open())
                                {
                                    await blobClient.UploadAsync(entryStream, new BlobUploadOptions { HttpHeaders = blobHttpHeaders });
                                }
                            }
                        }
                    }
                    else
                    {
                        // Split the filename to preserve folder structure
                        var fileNameParts = file.FileName.Split('/', StringSplitOptions.RemoveEmptyEntries);
                        if (fileNameParts.Length == 0)
                        {
                            return BadRequest(new { message = "Empty filename." });
                        }

                        // Validate directory parts to prevent directory traversal
                        var fileName = fileNameParts.Last();
                        var directoryParts = fileNameParts.Length > 1 ? fileNameParts.Take(fileNameParts.Length - 1).ToArray() : Array.Empty<string>();

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

                        var targetDir = $"submissions/{assignmentId}/{userName}/{uploadId}";
                        var fullPath = Path.Combine(targetDir, file.FileName);
                        // Absolute path check for directory traversal
                        var resolvedFullPath = Path.GetFullPath(fullPath);
                        var targetDirFullPath = Path.GetFullPath(targetDir);
                        if (!resolvedFullPath.StartsWith(targetDirFullPath))
                        {
                            return BadRequest(new { message = "Invalid file path due to directory traversal." });
                        }

                        // Construct the blob name from folder structure: 
                        // assignmentId/userName/uploadId/[subfolders]/filename
                        blobName = $"{assignmentId}/{userName}/{uploadId}";
                        if (directoryParts.Length > 0)
                        {
                            blobName += "/" + string.Join("/", directoryParts);
                        }
                        blobName += "/" + fileName;

                        // Upload the file stream and set file content type
                        var blobClient = containerClient.GetBlobClient(blobName);
                        var blobHttpHeaders = new BlobHttpHeaders
                        {
                            ContentType = file.ContentType
                        };

                        await blobClient.UploadAsync(file.OpenReadStream(), new BlobUploadOptions { HttpHeaders = blobHttpHeaders });
                    }
                }
                // Save submission details to the database
                var relativePath = $"{assignmentId}/{userName}/{uploadId}";
                var submission = new Submission
                {
                    SubmissionDate = DateTime.UtcNow,
                    FileName = relativePath,
                    AssignmentId = assignmentId,
                    FileData = new byte[1], // TODO: remove this field from db
                    PersonId = userId,
                };
                await _dbContext.Submissions.AddAsync(submission);

                try
                {
                    await _dbContext.SaveChangesAsync();
                }
                catch
                {
                    // Delete blobs if database save fails
                    var blobClient = containerClient.GetBlobClient(blobName);
                    await blobClient.DeleteAsync();

                    return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error saving submission to database." });
                }

                return Ok(new { Message = "Files uploaded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred during file upload.", Error = ex.Message });
            }
        }

        [HttpPost("UploadAttachmentFiles/{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UploadAttachmentFiles(int assignmentId, [FromForm] List<IFormFile> files)
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
                .Include(a => a.Subject.Teachers)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found" });
                }

                // // Save the files
                // var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads/assignments");

                // // The directory structure is: uploads/assignmentId/
                // var targetDir = Path.Combine(uploadsRoot, assignmentId.ToString());

                var containerClient = _blobServiceClient.GetBlobContainerClient("assignments");
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
                string blobName = string.Empty;

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

                    // Construct the blob name from folder structure: 
                    // assignmentId/[subfolders]/filename
                    blobName = $"{assignmentId}";
                    if (directoryParts.Length > 0)
                    {
                        blobName += "/" + string.Join("/", directoryParts);
                    }
                    blobName += "/" + fileName;

                    // Upload the file stream and set file content type
                    var blobClient = containerClient.GetBlobClient(blobName);
                    var blobHttpHeaders = new BlobHttpHeaders
                    {
                        ContentType = file.ContentType
                    };

                    await blobClient.UploadAsync(file.OpenReadStream(), new BlobUploadOptions { HttpHeaders = blobHttpHeaders });
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

        [HttpPost("RemoveAttachmentFile/{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> RemoveAttachmentFile(int assignmentId, [FromBody] string fileName)
        {
            try
            {
                // Get the user ID from the token
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                // Get the assignment
                var assignment = await _dbContext.Assignments
                .Include(a => a.Subject.Teachers)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found" });
                }

                var targetDir = $"assignments/{assignmentId}/";

                var fullPath = Path.Combine(targetDir, fileName);

                // Absolute path check for directory traversal
                var resolvedFullPath = Path.GetFullPath(fullPath);
                var targetDirFullPath = Path.GetFullPath(targetDir);
                if (!resolvedFullPath.StartsWith(targetDirFullPath))
                {
                    return BadRequest(new { message = "Invalid file path due to directory traversal." });
                }

                var containerClient = _blobServiceClient.GetBlobContainerClient("assignments");
                var blobName = $"{assignmentId}/{fileName}";

                var blobClient = containerClient.GetBlobClient(blobName);
                if (!await blobClient.ExistsAsync())
                {
                    return NotFound(new { message = "File not found." });
                }

                var res = await blobClient.DeleteAsync();
                if (res.IsError)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new
                    {
                        Message = "An error occurred during file removal.",
                    });
                }

                return Ok(new
                {
                    Message = "File removed successfully.",
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred during file removal.",
                });
            }
        }

        [HttpPut("RenameAttachmentFile/{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> RenameAttachmentFile(int assignmentId, [FromBody] RenameAttachmentFileDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Get the user ID from the token
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                // Get the assignment
                var assignment = await _dbContext.Assignments
                .Include(a => a.Subject.Teachers)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found" });
                }

                // var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads/assignments");

                // The directory structure is: uploads/assignmentId/
                // var targetDir = Path.Combine(uploadsRoot, assignmentId.ToString());
                var targetDir = $"assignments/{assignmentId}/";

                var fullPath = Path.Combine(targetDir, model.NewFileName);

                // Absolute path check for directory traversal
                var resolvedFullPath = Path.GetFullPath(fullPath);
                var targetDirFullPath = Path.GetFullPath(targetDir);
                if (!resolvedFullPath.StartsWith(targetDirFullPath))
                {
                    return BadRequest(new { message = "Invalid file path due to directory traversal." });
                }

                var containerClient = _blobServiceClient.GetBlobContainerClient("assignments");

                string oldBlobName = $"{assignmentId}/{model.OldFileName}";
                string newBlobName = $"{assignmentId}/{model.NewFileName}";

                var oldBlobClient = containerClient.GetBlobClient(oldBlobName);
                var newBlobClient = containerClient.GetBlobClient(newBlobName);

                // Check if the original blob exists
                if (!await oldBlobClient.ExistsAsync())
                {
                    return NotFound(new { message = "File not found." });
                }

                var copyOperation = await newBlobClient.StartCopyFromUriAsync(oldBlobClient.Uri);

                BlobProperties newBlobProperties = await newBlobClient.GetPropertiesAsync();
                while (newBlobProperties.CopyStatus == CopyStatus.Pending)
                {
                    await Task.Delay(500);
                    newBlobProperties = await newBlobClient.GetPropertiesAsync();
                }
                if (newBlobProperties.CopyStatus != CopyStatus.Success)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new
                    {
                        message = "Blob copy failed.",
                        copyStatus = newBlobProperties.CopyStatus
                    });
                }

                await oldBlobClient.DeleteAsync();

                return Ok(new { Message = "File renamed successfully." });

                // if (!System.IO.File.Exists(fullPath))
                // {
                //     return NotFound(new { message = "File not found." });
                // }

                // var newFullPath = Path.Combine(targetDir, model.NewFileName);

                // // Absolute path check for directory traversal
                // var resolvedNewFullPath = Path.GetFullPath(newFullPath);
                // if (!resolvedNewFullPath.StartsWith(targetDirFullPath))
                // {
                //     return BadRequest(new { message = "Invalid file path due to directory traversal." });
                // }

                // System.IO.File.Move(fullPath, newFullPath);

                // return Ok(new
                // {
                //     Message = "File renamed successfully.",
                // });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred during file renaming.",
                });
            }
        }

        [HttpGet("GetAttachmentFile/{assignmentId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAttachmentFile(int assignmentId, [FromQuery] string file)
        {
            try
            {
                // var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads/assignments");
                // var targetDir = Path.Combine(uploadsRoot, assignmentId.ToString());

                // if (!Directory.Exists(targetDir))
                // {
                //     return NotFound(new { message = "Assignment directory not found." });
                // }

                var targetDir = $"assignments/{assignmentId}/";

                var decodedFileName = System.Net.WebUtility.UrlDecode(file);
                var filePath = Path.Combine(targetDir, decodedFileName);
                var resolvedFullPath = Path.GetFullPath(filePath);
                var targetDirFullPath = Path.GetFullPath(targetDir);
                if (!resolvedFullPath.StartsWith(targetDirFullPath))
                {
                    return BadRequest(new { message = "Invalid file path due to directory traversal." });
                }

                var containerClient = _blobServiceClient.GetBlobContainerClient("assignments");

                var blobName = $"{assignmentId}/{decodedFileName}";
                var blobClient = containerClient.GetBlobClient(blobName);

                if (!await blobClient.ExistsAsync())
                {
                    return NotFound(new { message = "File not found." });
                }

                var downloadResponse = await blobClient.DownloadContentAsync();
                var blobStream = downloadResponse.Value.Content.ToStream();

                // Get content type
                string contentType = downloadResponse.Value.Details.ContentType;
                if (string.IsNullOrEmpty(contentType))
                {
                    var provider = new FileExtensionContentTypeProvider();
                    if (!provider.TryGetContentType(decodedFileName, out contentType))
                    {
                        contentType = "application/octet-stream";
                    }
                }

                return File(blobStream, contentType, Path.GetFileName(decodedFileName));

                // if (!System.IO.File.Exists(filePath))
                // {
                //     return NotFound(new { message = "File not found." });
                // }

                // var memory = new MemoryStream();
                // using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true))
                // {
                //     await stream.CopyToAsync(memory);
                // }
                // memory.Position = 0;

                // var provider = new FileExtensionContentTypeProvider();

                // if (!provider.TryGetContentType(filePath, out string contentType))
                // {
                //     contentType = "text/plain";
                // }

                // return File(memory, contentType, Path.GetFileName(filePath));
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

                var containerClient = _blobServiceClient.GetBlobContainerClient("submissions");

                string prefix = submission.FileName.TrimEnd('/') + "/";

                var fileTree = await FileTreeNode.BuildFileTreeFromBlobStorageAsync(containerClient, prefix);

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

        [HttpGet("GetAssignmentFileTree/{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAssignmentFileTree(int assignmentId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var assignment = await _dbContext.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                // var uploadsRoot = Path.Combine(_env.ContentRootPath, "uploads");
                // var targetDir = Path.Combine(uploadsRoot, "assignments", assignmentId.ToString());

                // if (!Directory.Exists(targetDir))
                // {
                //     return NotFound(new { message = "Assignment directory not found." });
                // }

                // var fileTree = FileTreeNode.CreateFromPath(targetDir);

                var containerClient = _blobServiceClient.GetBlobContainerClient("assignments");

                string prefix = $"{assignmentId}/";

                var fileTree = await FileTreeNode.BuildFileTreeFromBlobStorageAsync(containerClient, prefix);

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


        [HttpGet("GetUploadSettings")]
        public IActionResult GetUploadSettings()
        {
            return Ok(new
            {
                maxFileSize,
                maxTotalSize,
                allowedExtensions
            });
        }


        [HttpGet("DownloadSubmissionFile/{submissionId}")]
        [Authorize(Roles = "Student, Teacher")]
        public async Task<IActionResult> DownloadSubmissionFile(int submissionId, [FromQuery] string file)
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

                string containerName = "submissions";
                var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);

                var decodedFileName = System.Net.WebUtility.UrlDecode(file).Replace("\\", "/");

                string blobName = $"{submissionDb.FileName.TrimEnd('/')}/{decodedFileName}";

                var blobClient = containerClient.GetBlobClient(blobName);

                if (!await blobClient.ExistsAsync())
                {
                    return NotFound(new { message = "File not found." });
                }

                var downloadResponse = await blobClient.DownloadContentAsync();
                var blobStream = downloadResponse.Value.Content.ToStream();

                // Get content type
                string contentType = downloadResponse.Value.Details.ContentType;
                if (string.IsNullOrEmpty(contentType))
                {
                    var provider = new FileExtensionContentTypeProvider();
                    if (!provider.TryGetContentType(decodedFileName, out contentType))
                    {
                        contentType = "application/octet-stream";
                    }
                }

                return File(blobStream, contentType, Path.GetFileName(decodedFileName));
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

        [HttpGet("GetSubmissionComments/{submissionId}")]
        [Authorize(Roles = "Student, Teacher")]
        public async Task<IActionResult> GetSubmissionComments(int submissionId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var access = await _resourceAccessService.CanAccessSubmissionAsync(userId, submissionId, User.FindFirst(ClaimTypes.Role)?.Value);
                if (!access)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var submission = await _dbContext.Submissions
                .Include(s => s.Comments)
                .FirstOrDefaultAsync(s => s.Id == submissionId);

                if (submission == null)
                {
                    return NotFound(new { message = "Submission not found." });
                }

                var response = submission.Comments.Select(c => new SubmissionCommentDto
                {
                    Id = c.Id,
                    CommentDate = c.CommentDate,
                    FileName = c.FileName,
                    LineCommented = c.LineCommented,
                    Comment = c.Comment
                }).OrderBy(c => c.CommentDate).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred during fetching submission comments.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("ExportSubmissionFiles/{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> ExportSubmissionFiles(int assignmentId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var assignment = await _dbContext.Assignments
                .Include(a => a.Subject.Teachers)
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.PersonId == userId);

                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var containerClient = _blobServiceClient.GetBlobContainerClient("submissions");

                var prefix = $"{assignmentId}";

                var fileTree = await FileTreeNode.BuildFileTreeFromBlobStorageAsync(containerClient, prefix);

                var zipStream = new MemoryStream();
                using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
                {
                    await fileTree.ZipFilesAsync(zipArchive, containerClient);
                }

                zipStream.Position = 0;

                return File(zipStream, "application/zip", $"assignment_{assignmentId}_submissions.zip");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "An error occurred during file export.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("CheckPlagiatism/{assignmentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CheckPlagiatism(int assignmentId, [FromQuery] string language)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "User ID not found in token." });
                }

                var access = await _resourceAccessService.CanAccessAssignmentAsync(userId, assignmentId, "Teacher");
                if (!access)
                {
                    return NotFound(new { message = "Assignment not found." });
                }

                var extensions = _config.GetSection($"LanguageExtensions:{language}").Get<string[]>();

                if (extensions == null || extensions.Length == 0)
                {
                    return BadRequest(new { Message = $"No extensions found for language: {language}" });
                }

                // TODO: smazat
                // return Ok(new { Link = "http://moss.stanford.edu/results/1/8403766510050/", Message = "Plagiatism check finished." });

                var containerClient = _blobServiceClient.GetBlobContainerClient("submissions");

                await FileTreeNode.DownloadSourceCodesAsync(containerClient, assignmentId.ToString(), Path.Combine(_env.ContentRootPath, "plagiatism/"), extensions);

                string mossPath = Path.Combine(_env.ContentRootPath, "moss.pl");

                var files = Directory.GetFiles(
                    Path.Combine(_env.ContentRootPath, $"plagiatism/{assignmentId}"),
                    "*",
                    SearchOption.AllDirectories
                );

                // File list as arguments
                var filesArgument = string.Join(" ", files.Select(f => $"\"{f}\""));

                var arguments = $"{mossPath} -l {language} -d {filesArgument}";

                var process = new Process
                {
                    // moss [-l language] [-d] [-b basefile1] ... [-b basefilen] [-m #] [-c "string"] file1 file2 file3 ..moss [-l language] [-d] [-b basefile1] ... [-b basefilen] [-m #] [-c "string"] file1 file2 file3 ..
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "perl",
                        Arguments = arguments, // $"{mossPath} -l {language} -d {_env.ContentRootPath}/plagiatism/{assignmentId}/*/*",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                    }
                };

                bool started = process.Start();
                if (!started)
                {
                    throw new Exception("Failed to start the process.");
                }

                await process.WaitForExitAsync();

                var output = process.StandardOutput.ReadToEnd();
                var error = process.StandardError.ReadToEnd();

                if (!string.IsNullOrEmpty(error))
                {
                    throw new Exception(error);
                }

                var url = output.Split('\n')[^2];

                // Delete the downloaded files
                Directory.Delete(Path.Combine(_env.ContentRootPath, "plagiatism", assignmentId.ToString()), true);

                return Ok(new { Link = url, Message = "Plagiatism check finished." });
            }
            catch (Exception ex)
            {
                if (Directory.Exists(Path.Combine(_env.ContentRootPath, "plagiatism", assignmentId.ToString())))
                {
                    Directory.Delete(Path.Combine(_env.ContentRootPath, "plagiatism", assignmentId.ToString()), true);
                }

                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred during plagiarism check.", Error = ex.Message });
            }

        }

    }
}
