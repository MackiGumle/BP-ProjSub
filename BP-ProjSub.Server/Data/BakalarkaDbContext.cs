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

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<Submission> Submissions { get; set; }

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
                .IsUnicode(false);
            entity.Property(e => e.DueDate).HasColumnType("datetime");
            entity.Property(e => e.PersonId).HasColumnName("Person_Id");
            entity.Property(e => e.SubjectId).HasColumnName("Subject_Id");
            entity.Property(e => e.Title)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.Type)
                .HasMaxLength(25)
                .IsUnicode(false);

            entity.HasOne(d => d.Person).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.PersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Assignment_Person_FK");

            entity.HasOne(d => d.Subject).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Assignment_Subject_FK");
        });

        modelBuilder.Entity<Person>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Person_PK");

            entity.ToTable("Person");

            entity.Property(e => e.Email)
                .HasMaxLength(254)
                .IsUnicode(false);
            // entity.Property(e => e.Name)
            //     .HasMaxLength(25)
            //     .IsUnicode(false);
            // entity.Property(e => e.Password)
            //     .HasMaxLength(64)
            //     .IsUnicode(false);
            // entity.Property(e => e.Surname)
            //     .HasMaxLength(25)
            //     .IsUnicode(false);

            entity.HasMany(d => d.Subjects).WithMany(p => p.People)
                .UsingEntity<Dictionary<string, object>>(
                    "PersonSubject",
                    r => r.HasOne<Subject>().WithMany()
                        .HasForeignKey("SubjectId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("PersonSubject_Subject_FK"),
                    l => l.HasOne<Person>().WithMany()
                        .HasForeignKey("PersonId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("PersonSubject_Person_FK"),
                    j =>
                    {
                        j.HasKey("PersonId", "SubjectId").HasName("PersonSubject_PK");
                        j.ToTable("PersonSubject");
                        j.IndexerProperty<int>("PersonId").HasColumnName("Person_Id");
                        j.IndexerProperty<int>("SubjectId").HasColumnName("Subject_Id");
                    });
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
            entity.Property(e => e.PersonId).HasColumnName("Person_Id");
            entity.Property(e => e.Rating1)
                .HasColumnType("numeric(28, 0)")
                .HasColumnName("Rating");
            entity.Property(e => e.SubmissionId).HasColumnName("Submission_Id");

            entity.HasOne(d => d.Person).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.PersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Rating_Person_FK");

            entity.HasOne(d => d.Submission).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.SubmissionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Rating_Submission_FK");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Subject_PK");

            entity.ToTable("Subject");

            entity.Property(e => e.Description)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.Language)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(25)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Submission_PK");

            entity.ToTable("Submission");

            entity.Property(e => e.AssignmentId).HasColumnName("Assignment_Id");
            entity.Property(e => e.FileData).HasMaxLength(1);
            entity.Property(e => e.FileName)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.PersonId).HasColumnName("Person_Id");
            entity.Property(e => e.SubmissionDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Assignment).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.AssignmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Submission_Assignment_FK");

            entity.HasOne(d => d.Person).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.PersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Submission_Person_FK");
        });

        // IdentityDbContext udajne potrebuje toto: https://stackoverflow.com/questions/34000091/the-entity-type-microsoft-aspnet-identity-entityframework-identityuserloginstr
        base.OnModelCreating(modelBuilder);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
