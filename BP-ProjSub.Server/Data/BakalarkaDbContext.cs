using System;
using System.Collections.Generic;
using BP_ProjSub.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BP_ProjSub.Server.Data;

public partial class BakalarkaDbContext : IdentityDbContext<Person>
{
    public BakalarkaDbContext()
    {
    }

    public BakalarkaDbContext(DbContextOptions<BakalarkaDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<Person> People { get; set; }

    public virtual DbSet<Rating> Ratings { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<Submission> Submissions { get; set; }

    public virtual DbSet<Teacher> Teachers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:BakalarkaDB");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Assignment_PK");

            entity.ToTable("Assignment");

            entity.Property(e => e.DateAssigned)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .IsUnicode(true);
            entity.Property(e => e.DueDate).HasColumnType("datetime");
            entity.Property(e => e.SubjectId).HasColumnName("Subject_Id");
            entity.Property(e => e.TeacherPersonId).HasColumnName("Teacher_Person_Id");
            entity.Property(e => e.Title)
                .HasMaxLength(25)
                .IsUnicode(true);
            entity.Property(e => e.Type)
                .HasMaxLength(25)
                .IsUnicode(true);

            entity.HasOne(d => d.Subject).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Assignment_Subject_FK");

            entity.HasOne(d => d.TeacherPerson).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.TeacherPersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Assignment_Teacher_FK");
        });

        modelBuilder.Entity<Person>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Person_PK");

            entity.ToTable("Person");

            entity.Property(e => e.Email)
                .HasMaxLength(254)
                .IsUnicode(false);
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
                .IsUnicode(true);
            entity.Property(e => e.Rating1)
                .HasColumnType("numeric(28, 0)")
                .HasColumnName("Rating");
            entity.Property(e => e.SubmissionId).HasColumnName("Submission_Id");
            entity.Property(e => e.TeacherPersonId).HasColumnName("Teacher_Person_Id");

            entity.HasOne(d => d.Submission).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.SubmissionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Rating_Submission_FK");

            entity.HasOne(d => d.TeacherPerson).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.TeacherPersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Rating_Teacher_FK");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.PersonId).HasName("Student_PK");

            entity.ToTable("Student");

            entity.Property(e => e.PersonId)
                .ValueGeneratedNever()
                .HasColumnName("Person_Id");
            entity.Property(e => e.Faculty)
                .HasMaxLength(40)
                .IsUnicode(true);
            entity.Property(e => e.StudyForm)
                .HasMaxLength(25)
                .IsUnicode(true)
                .HasColumnName("Study_form");
            entity.Property(e => e.StudyType)
                .HasMaxLength(25)
                .IsUnicode(true)
                .HasColumnName("Study_type");

            entity.HasOne(d => d.Person).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.PersonId)
                .HasConstraintName("Student_Person_FK");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Subject_PK");

            entity.ToTable("Subject");

            entity.Property(e => e.Description)
                .HasMaxLength(25)
                .IsUnicode(true);
            entity.Property(e => e.Language)
                .HasMaxLength(25)
                .IsUnicode(true);
            entity.Property(e => e.Name)
                .HasMaxLength(25)
                .IsUnicode(true);

            entity.HasMany(d => d.Students).WithMany(p => p.Subjects)
                .UsingEntity<Dictionary<string, object>>(
                    "SubjectStudent",
                    r => r.HasOne<Student>().WithMany()
                        .HasForeignKey("StudentId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Relation_13_Student_FK"),
                    l => l.HasOne<Subject>().WithMany()
                        .HasForeignKey("SubjectId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Relation_13_Subject_FK"),
                    j =>
                    {
                        j.HasKey("SubjectId", "StudentId").HasName("Relation_13_PK");
                        j.ToTable("SubjectStudent");
                        j.IndexerProperty<int>("SubjectId").HasColumnName("Subject_Id");
                        j.IndexerProperty<int>("StudentId").HasColumnName("Student_Id");
                    });
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Submission_PK");

            entity.ToTable("Submission");

            entity.Property(e => e.AssignmentId).HasColumnName("Assignment_Id");
            entity.Property(e => e.FileData).HasMaxLength(1);
            entity.Property(e => e.FileName)
                .HasMaxLength(25)
                .IsUnicode(true);
            entity.Property(e => e.StudentPersonId).HasColumnName("Student_Person_Id");
            entity.Property(e => e.SubmissionDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Assignment).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.AssignmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Submission_Assignment_FK");

            entity.HasOne(d => d.StudentPerson).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.StudentPersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Submission_Student_FK");
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.PersonId).HasName("Teacher_PK");

            entity.ToTable("Teacher");

            entity.Property(e => e.PersonId)
                .ValueGeneratedNever()
                .HasColumnName("Person_Id");
            entity.Property(e => e.Office)
                .HasMaxLength(25)
                .IsUnicode(true);

            entity.HasOne(d => d.Person).WithOne(p => p.Teacher)
                .HasForeignKey<Teacher>(d => d.PersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Teacher_Person_FK");

            entity.HasMany(d => d.Subjects).WithMany(p => p.TeacherPeople)
                .UsingEntity<Dictionary<string, object>>(
                    "Teach",
                    r => r.HasOne<Subject>().WithMany()
                        .HasForeignKey("SubjectId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Relation_6_Subject_FK"),
                    l => l.HasOne<Teacher>().WithMany()
                        .HasForeignKey("TeacherPersonId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("Relation_6_Teacher_FK"),
                    j =>
                    {
                        j.HasKey("TeacherPersonId", "SubjectId").HasName("Relation_6_PK");
                        j.ToTable("Teaches");
                        j.IndexerProperty<int>("TeacherPersonId").HasColumnName("Teacher_Person_Id");
                        j.IndexerProperty<int>("SubjectId").HasColumnName("Subject_Id");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
