using System.Reflection.Metadata;
using Azure.Storage.Blobs;
using BP_ProjSub.Server.Data;
using BP_ProjSub.Server.Data.Dtos;
using BP_ProjSub.Server.Data.Dtos.Auth;
using BP_ProjSub.Server.Data.Dtos.Teacher;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Services
{
    /// <summary>
    /// Service for managing subjects.
    /// Does not handle authentication or authorization.
    /// </summary>
    public class SubjectService
    {
        private readonly BakalarkaDbContext _dbContext;
        private readonly AccountService _accountService;
        private readonly IConfiguration _config;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly AssignmentService _assignmentService;

        public SubjectService(
            BakalarkaDbContext dbContext, AccountService accountService,
            IConfiguration config, AssignmentService assignmentService)
        {
            _dbContext = dbContext;
            _accountService = accountService;
            _config = config;
            _blobServiceClient = new BlobServiceClient(_config["ConnectionStrings:BakalarkaBlob"]);
            _assignmentService = assignmentService;
        }

        /// <summary>
        /// Creates a new subject and assigns it to a teacher. <br/>
        /// This should be done as a transaction.
        /// </summary>
        /// <param name="Subject"></param>
        /// <param name="personId">PersonId of the teacher</param>
        /// <returns>The created subject</returns>
        /// <exception cref="KeyNotFoundException">Thrown when the teacher is not found.</exception>
        public async Task<Subject> CreateSubjectAsync(Subject subject, string personId)
        {
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

                return newSubject;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Adds students to a subject. <br/>
        /// If a student is already in the subject, they are not added again. <br/>
        /// If a student is not found, they are ignored. <br/>
        /// This should be done as a transaction. <br/>
        /// </summary>
        /// <param name="subject">The subject to add students to.</param>
        /// <param name="studentLogins"></param>
        /// <returns>The subject with added students</returns>
        public async Task<Subject> AddStudentsToSubjectAsync(Subject subject, List<string> studentLogins)
        {
            try
            {
                if (studentLogins == null || studentLogins.Count == 0)
                {
                    throw new InvalidOperationException("No student logins provided.");
                }

                var subjectWithStudents = await _dbContext.Subjects
                    .Include(s => s.Students)
                    .FirstOrDefaultAsync(s => s.Id == subject.Id);

                if (subjectWithStudents == null)
                {
                    throw new KeyNotFoundException("Subject not found.");
                }

                studentLogins = studentLogins.Select(s => s.ToLower()).ToList();
                var uniqueStudentLogins = studentLogins.Distinct().ToList();

                // Get only students with the logins
                var students = await _dbContext.Students
                    .Include(s => s.Person)
                    .Where(s => uniqueStudentLogins.Contains(s.Person.UserName))
                    .ToListAsync();

                // Add students to the subject
                foreach (var student in students)
                {
                    // If student is not already in the subject
                    if (!subjectWithStudents.Students.Any(s => s.PersonId == student.PersonId))
                    {
                        subjectWithStudents.Students.Add(student);
                    }
                }

                return subjectWithStudents;
            }
            catch
            {
                throw;
            }
        }

        public async Task<Subject> RemoveStudentsFromSubjectAsync(int subjectId, List<string> studentLogins)
        {
            try
            {
                if (studentLogins == null || studentLogins.Count == 0)
                {
                    throw new InvalidOperationException("No student logins provided.");
                }

                var subjectWithStudents = await _dbContext.Subjects
                    .Include(s => s.Students)
                    .FirstOrDefaultAsync(s => s.Id == subjectId);

                if (subjectWithStudents == null)
                {
                    throw new KeyNotFoundException("Subject not found.");
                }

                studentLogins = studentLogins.Select(s => s.ToLower()).ToList();
                var uniqueStudentLogins = studentLogins.Distinct().ToList();

                // Get only students with the logins
                var students = await _dbContext.Students
                    .Include(s => s.Person)
                    .Where(s => uniqueStudentLogins.Contains(s.Person.UserName))
                    .ToListAsync();

                // Remove students from the subject
                foreach (var student in students)
                {
                    // If student is in the subject
                    if (subjectWithStudents.Students.Any(s => s.PersonId == student.PersonId))
                    {
                        subjectWithStudents.Students.Remove(student);
                    }
                }

                return subjectWithStudents;
            }
            catch
            {
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
        /// Edits an subject that the teacher teaches. <br/>
        /// This is done as a transaction.
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

        /// <summary>
        /// Deletes a subject and all its assignments. <br/>
        /// Also deletes all submissions and attachments in Azure blob storage.
        /// </summary>
        /// <param name="subjectId"></param>
        /// <param name="personId"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        public async Task DeleteSubjectAsync(int subjectId, string personId)
        {
            var subject = await _dbContext.Subjects
                .Include(s => s.Assignments)
                .FirstOrDefaultAsync(s => s.Id == subjectId);

            if (subject == null)
            {
                throw new KeyNotFoundException("Subject not found.");
            }

            var assignments = subject.Assignments.ToList();

            try
            {
                await _assignmentService.DeleteAssignmentsAsync(assignments.Select(a => a.Id));
            }
            catch
            {
                throw;
            }
        }
    }
}
