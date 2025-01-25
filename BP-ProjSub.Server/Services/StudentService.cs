using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Services;

public class StudentService
{
    private readonly BakalarkaDbContext _dbContext;

    public StudentService(BakalarkaDbContext dbContext)
    {
        _dbContext = dbContext;
    }



    /// <summary>
    /// Gets or creates students by their logins. Throws if any login is invalid.
    /// </summary>
    public async Task<List<Student>> GetOrCreateStudentsByLoginsAsync(List<string> logins)
    {
        var distinctLogins = logins.Distinct().ToList();

        var users = await _dbContext.Users
            .Where(u => distinctLogins.Contains(u.UserName))
            .ToListAsync();

        var missingLogins = distinctLogins.Except(users.Select(u => u.UserName)).ToList();

        // Get existing students or create new ones if they don't exist
        var personIds = users.Select(u => u.Id).ToList();
        var existingStudents = await _dbContext.Students
            .Where(s => personIds.Contains(s.PersonId))
            .ToListAsync();

        var existingPersonIds = existingStudents.Select(s => s.PersonId).ToHashSet();
        var newStudents = users
            .Where(u => !existingPersonIds.Contains(u.Id))
            .Select(u => new Student { PersonId = u.Id })
            .ToList();

        if (newStudents.Any())
        {
            await _dbContext.Students.AddRangeAsync(newStudents);
        }

        return existingStudents.Concat(newStudents).ToList();
    }
}