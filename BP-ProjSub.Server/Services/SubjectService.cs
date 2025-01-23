using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Services
{
    public class SubjectService
    {
        private readonly BakalarkaDbContext _context;

        public SubjectService(BakalarkaDbContext context)
        {
            _context = context;
        }

        public async Task<Subject> CreateSubjectAsync(string name, string description, string teacherId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var newSubject = new Subject
                {
                    Name = name,
                    Description = description,
                };
                _context.Subjects.Add(newSubject);

                var teacher = await _context.Teachers
                    .Include(t => t.SubjectsTaught)
                    .FirstOrDefaultAsync(t => t.PersonId == teacherId);

                teacher.SubjectsTaught.Add(newSubject);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return newSubject;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<Subject>> GetSubjectsByUserIdAsync(string userId, string role)
        {
            if (role == "Admin")
            {
                return await _context.Subjects.ToListAsync();
            }

            if (role == "Teacher")
            {
                var teacher = await _context.Teachers
                    .Include(t => t.SubjectsTaught)
                    .FirstOrDefaultAsync(t => t.PersonId == userId);

                return teacher?.SubjectsTaught.ToList() ?? new List<Subject>();
            }

            if (role == "Student")
            {
                var student = await _context.Students
                    .Include(s => s.Subjects)
                    .FirstOrDefaultAsync(s => s.PersonId == userId);

                return student?.Subjects.ToList() ?? new List<Subject>();
            }

            return new List<Subject>();
        }
    }
}
