using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos;
using BP_ProjSub.Server.Data.Dtos.Teacher;
using BP_ProjSub.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Services
{
    public class SubjectService
    {
        private readonly BakalarkaDbContext _dbContext;

        public SubjectService(BakalarkaDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Creates a new subject and assigns it to a teacher.
        /// </summary>
        /// <param name="createSubjectDto"></param>
        /// <param name="personId">PersonId of the teacher</param>
        /// <returns>The created subject</returns>
        /// <exception cref="KeyNotFoundException">Thrown when the teacher is not found.</exception>
        public async Task<Subject> CreateSubjectAsync(CreateSubjectDto createSubjectDto, string personId)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var newSubject = new Subject
                {
                    Name = createSubjectDto.Name,
                    Description = createSubjectDto.Description,
                };
                _dbContext.Subjects.Add(newSubject);

                var teacher = await _dbContext.Teachers
                    .Include(t => t.SubjectsTaught)
                    .FirstOrDefaultAsync(t => t.PersonId == personId);

                if (teacher == null)
                {
                    throw new KeyNotFoundException("Teacher not found.");
                }

                teacher.SubjectsTaught.Add(newSubject);

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return newSubject;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        /// <summary>
        /// Gets all subjects that user studies or teaches.
        /// </summary>
        /// <param name="personId"></param>
        /// <param name="userRole"></param>
        /// <returns>A list of subjects.</returns>
        /// <exception cref="KeyNotFoundException">Thrown when the teacher or student is not found.</exception>
        public async Task<List<Subject>> GetSubjectsByPersonIdAsync(string personId, string userRole)
        {
            List<Subject> subjects = new List<Subject>();

            if (userRole == "Teacher")
            {
                var teacher = await _dbContext.Teachers
                    .Include(t => t.SubjectsTaught)
                    .FirstOrDefaultAsync(t => t.PersonId == personId);

                if (teacher == null)
                {
                    throw new KeyNotFoundException("Teacher not found.");
                }

                subjects = teacher.SubjectsTaught.ToList();
            }
            else if (userRole == "Student")
            {
                var student = await _dbContext.Students
                    .Include(s => s.Subjects)
                    .FirstOrDefaultAsync(s => s.PersonId == personId);

                if (student == null)
                {
                    throw new KeyNotFoundException("Student not found.");
                }

                subjects = student.Subjects.ToList();
            }

            return subjects;
        }

        /// <summary>
        /// Edits an existing subject.
        /// </summary>
        /// <param name="subjectDto">The subject DTO containing updated information.</param>
        /// <param name="personId">PersonId of teacher that teacher the subject.</param>
        /// <returns>The updated subject</returns>
        /// <exception cref="KeyNotFoundException">Thrown when the teacher or subject is not found.</exception>
        /// 
        public async Task<Subject> EditSubjectAsync(SubjectDto subjectDto, string personId)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var teacher = await _dbContext.Teachers
                    .Include(t => t.SubjectsTaught)
                    .FirstOrDefaultAsync(t => t.PersonId == personId);

                if (teacher == null)
                {
                    throw new KeyNotFoundException("Teacher not found.");
                }

                var subject = await _dbContext.Subjects
                    .FirstOrDefaultAsync(s => s.Id == subjectDto.Id);

                if (subject == null)
                {
                    throw new KeyNotFoundException("Subject not found.");
                }

                subject.Name = subjectDto.Name;
                subject.Description = subjectDto.Description;

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return subject;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
