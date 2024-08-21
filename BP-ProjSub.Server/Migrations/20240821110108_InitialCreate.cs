using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BP_ProjSub.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Person",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Surname = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Email = table.Column<string>(type: "varchar(254)", unicode: false, maxLength: 254, nullable: false),
                    Password = table.Column<string>(type: "varchar(64)", unicode: false, maxLength: 64, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Person_PK", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Subject",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Description = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Language = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Subject_PK", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Student",
                columns: table => new
                {
                    Person_Id = table.Column<int>(type: "int", nullable: false),
                    Semester = table.Column<int>(type: "int", nullable: true),
                    Study_form = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Study_type = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Faculty = table.Column<string>(type: "varchar(40)", unicode: false, maxLength: 40, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Student_PK", x => x.Person_Id);
                    table.ForeignKey(
                        name: "Student_Person_FK",
                        column: x => x.Person_Id,
                        principalTable: "Person",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Teacher",
                columns: table => new
                {
                    Person_Id = table.Column<int>(type: "int", nullable: false),
                    Office = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Teacher_PK", x => x.Person_Id);
                    table.ForeignKey(
                        name: "Teacher_Person_FK",
                        column: x => x.Person_Id,
                        principalTable: "Person",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SubjectStudent",
                columns: table => new
                {
                    Subject_Id = table.Column<int>(type: "int", nullable: false),
                    Student_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Relation_13_PK", x => new { x.Subject_Id, x.Student_Id });
                    table.ForeignKey(
                        name: "Relation_13_Student_FK",
                        column: x => x.Student_Id,
                        principalTable: "Student",
                        principalColumn: "Person_Id");
                    table.ForeignKey(
                        name: "Relation_13_Subject_FK",
                        column: x => x.Subject_Id,
                        principalTable: "Subject",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Assignment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Title = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    Description = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    DateAssigned = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    DueDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    MaxPoints = table.Column<long>(type: "bigint", nullable: true),
                    Teacher_Person_Id = table.Column<int>(type: "int", nullable: false),
                    Subject_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Assignment_PK", x => x.Id);
                    table.ForeignKey(
                        name: "Assignment_Subject_FK",
                        column: x => x.Subject_Id,
                        principalTable: "Subject",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "Assignment_Teacher_FK",
                        column: x => x.Teacher_Person_Id,
                        principalTable: "Teacher",
                        principalColumn: "Person_Id");
                });

            migrationBuilder.CreateTable(
                name: "Teaches",
                columns: table => new
                {
                    Teacher_Person_Id = table.Column<int>(type: "int", nullable: false),
                    Subject_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Relation_6_PK", x => new { x.Teacher_Person_Id, x.Subject_Id });
                    table.ForeignKey(
                        name: "Relation_6_Subject_FK",
                        column: x => x.Subject_Id,
                        principalTable: "Subject",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "Relation_6_Teacher_FK",
                        column: x => x.Teacher_Person_Id,
                        principalTable: "Teacher",
                        principalColumn: "Person_Id");
                });

            migrationBuilder.CreateTable(
                name: "Submission",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubmissionDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    FileName = table.Column<string>(type: "varchar(25)", unicode: false, maxLength: 25, nullable: true),
                    FileData = table.Column<byte[]>(type: "varbinary(1)", maxLength: 1, nullable: true),
                    Student_Person_Id = table.Column<int>(type: "int", nullable: false),
                    Assignment_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Submission_PK", x => x.Id);
                    table.ForeignKey(
                        name: "Submission_Assignment_FK",
                        column: x => x.Assignment_Id,
                        principalTable: "Assignment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "Submission_Student_FK",
                        column: x => x.Student_Person_Id,
                        principalTable: "Student",
                        principalColumn: "Person_Id");
                });

            migrationBuilder.CreateTable(
                name: "Rating",
                columns: table => new
                {
                    Time = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    Rating = table.Column<decimal>(type: "numeric(28,0)", nullable: true),
                    Note = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    Teacher_Person_Id = table.Column<int>(type: "int", nullable: false),
                    Submission_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Rating_PK", x => x.Time);
                    table.ForeignKey(
                        name: "Rating_Submission_FK",
                        column: x => x.Submission_Id,
                        principalTable: "Submission",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "Rating_Teacher_FK",
                        column: x => x.Teacher_Person_Id,
                        principalTable: "Teacher",
                        principalColumn: "Person_Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Subject_Id",
                table: "Assignment",
                column: "Subject_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Teacher_Person_Id",
                table: "Assignment",
                column: "Teacher_Person_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Rating_Submission_Id",
                table: "Rating",
                column: "Submission_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Rating_Teacher_Person_Id",
                table: "Rating",
                column: "Teacher_Person_Id");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectStudent_Student_Id",
                table: "SubjectStudent",
                column: "Student_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Submission_Assignment_Id",
                table: "Submission",
                column: "Assignment_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Submission_Student_Person_Id",
                table: "Submission",
                column: "Student_Person_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Teaches_Subject_Id",
                table: "Teaches",
                column: "Subject_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Rating");

            migrationBuilder.DropTable(
                name: "SubjectStudent");

            migrationBuilder.DropTable(
                name: "Teaches");

            migrationBuilder.DropTable(
                name: "Submission");

            migrationBuilder.DropTable(
                name: "Assignment");

            migrationBuilder.DropTable(
                name: "Student");

            migrationBuilder.DropTable(
                name: "Subject");

            migrationBuilder.DropTable(
                name: "Teacher");

            migrationBuilder.DropTable(
                name: "Person");
        }
    }
}
