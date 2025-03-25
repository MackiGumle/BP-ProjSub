using System;
using Azure.Storage.Blobs;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Helpers;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Services;

public class AssignmentService
{
    private readonly BakalarkaDbContext _dbContext;
    private readonly IConfiguration _config;
    private readonly BlobServiceClient _blobServiceClient;


    public AssignmentService(BakalarkaDbContext dbContext, IConfiguration config)
    {
        _dbContext = dbContext;
        _config = config;
        _blobServiceClient = new BlobServiceClient(_config["ConnectionStrings:BakalarkaBlob"]);
    }

    /// <summary>
    /// Deletes an assignment and its related submissions.
    /// </summary>
    /// <param name="assignmentId"></param>
    /// <returns></returns>
    /// <exception cref="KeyNotFoundException">Assignment not found.</exception>
    public async Task DeleteAssignmentAsync(int assignmentId)
    {
        var assignment = await _dbContext.Assignments
                        // .Include(a => a.Submissions)
                        .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
        {
            throw new KeyNotFoundException("Assignment not found.");
        }

        // Remove attachments from azure blob storage at /assignments/assignmentId/
        var containerClient = _blobServiceClient.GetBlobContainerClient("assignments");
        var prefix = $"{assignmentId}/";

        await BlobStorageHelper.DeleteBlobsWithPrefixAsync(containerClient, prefix);

        // Remove submissions from azure blob storage at /submissions/assignmentId/
        var submissionsContainerClient = _blobServiceClient.GetBlobContainerClient("submissions");
        var submissionsPrefix = $"{assignmentId}/";

        // Delete blobs with prefix
        await BlobStorageHelper.DeleteBlobsWithPrefixAsync(submissionsContainerClient, submissionsPrefix);

        _dbContext.Assignments.Remove(assignment);
        await _dbContext.SaveChangesAsync();
    }


    /// <summary>
    /// Deletes multiple assignments and their related submissions.
    /// Also deletes all attachments and submissions from azure blob storage.
    /// </summary>
    /// <param name="assignmentIds"></param>
    /// <returns></returns>
    /// <exception cref="KeyNotFoundException">Assignment not found</exception>
    public async Task DeleteAssignmentsAsync(IEnumerable<int> assignmentIds)
    {
        var ids = assignmentIds.ToList();
        if (!ids.Any())
        {
            return;
        }

        var assignments = await _dbContext.Assignments
            .Where(a => ids.Contains(a.Id))
            .ToListAsync();

        // Check if all assignments exist
        var foundIds = assignments.Select(a => a.Id).ToHashSet();
        var missingIds = ids.Where(id => !foundIds.Contains(id)).ToList();
        if (missingIds.Any())
        {
            throw new KeyNotFoundException($"Assignments not found: {string.Join(", ", missingIds)}");
        }

        // Get container clients
        var assignmentsContainer = _blobServiceClient.GetBlobContainerClient("assignments");
        var submissionsContainer = _blobServiceClient.GetBlobContainerClient("submissions");

        // Delete blobs for all assignments
        foreach (var assignment in assignments)
        {
            // Delete assignment attachments
            await BlobStorageHelper.DeleteBlobsWithPrefixAsync(assignmentsContainer, $"{assignment.Id}/");

            // Delete related submissions
            await BlobStorageHelper.DeleteBlobsWithPrefixAsync(submissionsContainer, $"{assignment.Id}/");
        }

        // Remove all assignments
        _dbContext.Assignments.RemoveRange(assignments);
        await _dbContext.SaveChangesAsync();
    }
}
