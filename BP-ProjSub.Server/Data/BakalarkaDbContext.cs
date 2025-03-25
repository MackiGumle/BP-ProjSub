using System;
using System.Collections.Generic;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Data;

public partial class BakalarkaDbContext : IdentityDbContext<Person>
{
    private readonly IConfiguration _config;

    public BakalarkaDbContext(IConfiguration config)
    {
        _config = config;
    }

    public BakalarkaDbContext(DbContextOptions<BakalarkaDbContext> options, IConfiguration config)
        : base(options)
    {
        _config = config;
    }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<Person> People { get; set; }

    public virtual DbSet<Rating> Ratings { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<Submission> Submissions { get; set; }

    // v db SubmissionComment
    // public virtual DbSet<SubmissionComment> SubmissionComments { get; set; }
    public virtual DbSet<SubmissionComment> SubmissionComment { get; set; }

    public virtual DbSet<Teacher> Teachers { get; set; }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<AssignmentViewLog> AssignmentViewLogs { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(_config["ConnectionStrings:BakalarkaDB"]);
    // => optionsBuilder.UseSqlServer("BakalarkaDB");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.ToTable("Assignment");
        });

        modelBuilder.Entity<Person>(entity =>
        {
            entity.ToTable("Person");
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.ToTable("Teacher");
        });

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.ToTable("Admin");
        });

        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(e => e.Time).HasName("Rating_PK");

            entity.ToTable("Rating");

            entity.Property(e => e.Time)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Note)
                .HasMaxLength(500)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.ToTable("Subject");
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.ToTable("Submission");

            entity.Property(e => e.SubmissionDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Student).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.PersonId)
                //Nemuze byt Cascade: Foreign key constraint may cause cycles or multiple cascade paths
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Submission_Person_FK");
        });

        modelBuilder.Entity<AssignmentViewLog>(entity =>
        {
            entity.ToTable("AssignmentViewLog");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.IpAddress)
                .HasMaxLength(45)
                .IsUnicode(false);

            entity.HasOne(avl => avl.Assignment)
                .WithMany(a => a.AssignmentViewLogs)
                .HasForeignKey(avl => avl.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(avl => avl.Student)
                .WithMany(s => s.AssignmentViewLogs)
                .HasForeignKey(avl => avl.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        List<IdentityRole> roles = new List<IdentityRole>
        {
            new IdentityRole { Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Name = "Teacher", NormalizedName = "TEACHER" },
            new IdentityRole { Name = "Student", NormalizedName = "STUDENT" }
        };
        modelBuilder.Entity<IdentityRole>().HasData(roles);

        var admin = new Person
        {
            UserName = "Admin",
            Email = "admin@example.com",
            NormalizedUserName = "ADMIN",
            NormalizedEmail = "ADMIN@EXAMPLE.COM",
            PasswordHash = new PasswordHasher<Person>().HashPassword(null, "P@ssw0rd"),
            EmailConfirmed = true,
        };

        modelBuilder.Entity<Person>().HasData(admin);
        modelBuilder.Entity<IdentityUserRole<string>>().HasData(new IdentityUserRole<string>
        {
            RoleId = roles[0].Id,
            UserId = admin.Id
        });


        // IdentityDbContext udajne potrebuje toto: https://stackoverflow.com/questions/34000091/the-entity-type-microsoft-aspnet-identity-entityframework-identityuserloginstr
        base.OnModelCreating(modelBuilder);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
