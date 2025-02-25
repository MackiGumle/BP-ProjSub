using System;
using BP_ProjSub.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Services;

public class ResourceAccessService
{
    private readonly BakalarkaDbContext _dbContext;

    public ResourceAccessService(BakalarkaDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> CanAccessSubjectAsync(string userId, int subjectId, string role)
    {
        if (role == "Student")
        {
            return await _dbContext.Students
                .Include(s => s.Subjects)
                .AnyAsync(s => s.PersonId == userId && s.Subjects.Any(sub => sub.Id == subjectId));
        }
        if (role == "Teacher")
        {
            return await _dbContext.Teachers
                .Include(t => t.SubjectsTaught)
                .AnyAsync(t => t.PersonId == userId && t.SubjectsTaught.Any(sub => sub.Id == subjectId));
        }

        return false;
    }

    /// <summary>
    /// Checks if a user can access an assignment.
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="assignmentId"></param>
    /// <param name="role"></param>
    /// <returns></returns>
    public async Task<bool> CanAccessAssignmentAsync(string userId, int assignmentId, string role)
    {
        var assignment = await _dbContext.Assignments
            .Include(a => a.Subject)
            .ThenInclude(s => s.Students)
            .Include(a => a.Teacher)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            return false;

        if (role == "Student")
        {
            return assignment.Subject.Students.Any(s => s.PersonId == userId);
        }
        if (role == "Teacher")
        {
            return assignment.Teacher.PersonId == userId;
        }

        return false;
    }

    public async Task<bool> CanAccessSubmissionAsync(string userId, int submissionId, string role)
    {
        var submission = await _dbContext.Submissions
            .Include(s => s.Assignment)
            .ThenInclude(a => a.Teacher)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
            return false;

        if (role == "Student")
        {
            return submission.Student.PersonId == userId;
        }
        if (role == "Teacher")
        {
            return submission.Assignment.Teacher.PersonId == userId;
        }

        return false;
    }
}
