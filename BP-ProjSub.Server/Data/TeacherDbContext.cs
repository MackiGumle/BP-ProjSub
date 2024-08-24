// using System;
// using BP_ProjSub.Server.Models;
// using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore;

// namespace BP_ProjSub.Server.Data;

// public class TeacherDbContext : IdentityDbContext<Teacher>
// {
//     public TeacherDbContext(DbContextOptions<TeacherDbContext> options) 
//         : base(options)
//     {
//     }

//     public DbSet<Assignment> Assignments { get; set; } = null!;

//     public DbSet<Person> People { get; set; } = null!;

//     public DbSet<Rating> Ratings { get; set; } = null!;

//     public DbSet<Subject> Subjects { get; set; } = null!;

//     public DbSet<Submission> Submissions { get; set; } = null!;

//     public DbSet<Teacher> Teachers { get; set; } = null!;
// }
