using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos;
using BP_ProjSub.Server.Data.Dtos.Auth;
using BP_ProjSub.Server.Data.Dtos.Teacher;
using BP_ProjSub.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Services
{
    public class SubjectService
    {
        private readonly BakalarkaDbContext _dbContext;
        private readonly AccountService _accountService;

        public SubjectService(BakalarkaDbContext dbContext, AccountService accountService)
        {
            _dbContext = dbContext;
            _accountService = accountService;
        }

        /// <summary>
        /// Creates a new subject and assigns it to a teacher. <br/>
        /// This is done as a transaction.
        /// </summary>
        /// <param name="Subject"></param>
        /// <param name="personId">PersonId of the teacher</param>
        /// <returns>The created subject</returns>
        /// <exception cref="KeyNotFoundException">Thrown when the teacher is not found.</exception>
        public async Task<Subject> CreateSubjectAsync(Subject subject, string personId)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var newSubject = new Subject
                {
                    Name = subject.Name,
                    Description = subject.Description,
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
        /// Adds students to a subject. <br/>
        /// If a student is already in the subject, they are not added again. <br/>
        /// If a student is not found, they are ignored. <br/>
        /// This is done as a transaction.
        /// </summary>
        /// <param name="subject"></param>
        /// <param name="studentLogins"></param>
        /// <returns>The subject with added students</returns>
        public async Task<Subject> AddStudentsToSubject(Subject subject, List<string> studentLogins)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                var subjectWithStudents = await _dbContext.Subjects
                    .Include(s => s.Students)
                    .FirstOrDefaultAsync(s => s.Id == subject.Id);

                if (subjectWithStudents == null)
                {
                    throw new KeyNotFoundException("Subject not found.");
                }

                var uniqueStudentLogins = studentLogins.Distinct().ToList();

                var students = await _dbContext.Students
                    .Include(s => s.Person)
                    .Where(s => uniqueStudentLogins.Contains(s.Person.UserName))
                    .ToListAsync();

                // // Get users with the given logins
                // var users = await _dbContext.Users
                //     .Where(u => uniqueStudentLogins.Contains(u.UserName))
                //     .ToListAsync();

                // var userIds = users.Select(u => u.Id).ToList();

                // // Get only users that are students
                // var students = await _dbContext.Students
                //     .Where(s => userIds.Contains(s.PersonId))
                //     .ToListAsync();

                // Add students to the subject
                foreach (var student in students)
                {
                    // If student is not already in the subject
                    if (!subjectWithStudents.Students.Any(s => s.PersonId == student.PersonId))
                    {
                        subjectWithStudents.Students.Add(student);
                    }
                }

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
                return subjectWithStudents;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // public async Task<Subject> CreateSubjectAndAddStudents(Subject subject, string teacherId, List<string> studentLogins)
        // {
        //     Subject? newSubject = null;
        //     try
        //     {
        //         newSubject = await CreateSubjectAsync(subject, teacherId);
        //     }
        //     catch (Exception)
        //     {
        //         throw;
        //     }

        //     // Students that are already in the database
        //     var studentsInDb = await _dbContext.Students
        //         .Include(s => s.Person)
        //         .Where(s => studentLogins.Contains(s.Person.UserName))
        //         .ToListAsync();

        //     // get student logins that are not in the database
        //     var studentLoginsInDb = studentsInDb.Select(s => s.Person.UserName).ToList();
        //     var studentLoginsNotInDb = studentLogins.Except(studentLoginsInDb).ToList();

        //     // create students that are not in the database
        //     List<Person> createdStudents = new List<Person>();
        //     foreach (var studentLogin in studentLoginsNotInDb)
        //     {
        //         var model = new CreateAccountDto
        //         {
        //             UserName = studentLogin,
        //             Email = studentLogin + "@vsb.cz",
        //             Role = "Student"
        //         };

        //         try
        //         {
        //             var newStudent = await _accountService.CreateAccountAsync(model);
        //             createdStudents.Add(newStudent);
        //         }
        //         catch (Exception ex)
        //         {
        //             throw new InvalidOperationException($"Failed to create student '{studentLogin}' account: {ex.Message}");
        //         }
        //     }

        //     // add created students to the subject
        //     var createdStudentIds = createdStudents.Select(s => s.Id).ToList();

            
        // }


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
        /// Edits an subject that the teacher teaches.
        /// </summary>
        /// <param name="subjectDto">The subject DTO containing updated information.</param>
        /// <param name="personId">PersonId of teacher that teaches the subject.</param>
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

                var subject = teacher.SubjectsTaught
                    .FirstOrDefault(s => s.Id == subjectDto.Id);

                if (subject == null)
                {
                    throw new KeyNotFoundException("Subject not found in teachers subjects.");
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
