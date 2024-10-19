using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BP_ProjSub.Server.Migrations
{
    /// <inheritdoc />
    public partial class DataAnnotationsTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "Assignment_Person_FK",
                table: "Assignment");

            migrationBuilder.DropForeignKey(
                name: "Assignment_Subject_FK",
                table: "Assignment");

            migrationBuilder.DropForeignKey(
                name: "Rating_Person_FK",
                table: "Rating");

            migrationBuilder.DropForeignKey(
                name: "Rating_Submission_FK",
                table: "Rating");

            migrationBuilder.DropForeignKey(
                name: "Submission_Assignment_FK",
                table: "Submission");

            migrationBuilder.DropForeignKey(
                name: "Submission_Person_FK",
                table: "Submission");

            migrationBuilder.DropTable(
                name: "PersonSubject");

            migrationBuilder.DropPrimaryKey(
                name: "Person_PK",
                table: "AspNetUsers");

            migrationBuilder.DropPrimaryKey(
                name: "Submission_PK",
                table: "Submission");

            migrationBuilder.DropPrimaryKey(
                name: "Subject_PK",
                table: "Subject");

            migrationBuilder.DropPrimaryKey(
                name: "Assignment_PK",
                table: "Assignment");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "6f23b961-528d-4483-91dc-9a05798706bc");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "b609f91d-aea7-4ca7-a8f9-21d151250296");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e9f5985b-6dbf-4290-8fff-8903993d65d8");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Rating");

            migrationBuilder.RenameTable(
                name: "Submission",
                newName: "Submissions");

            migrationBuilder.RenameTable(
                name: "Subject",
                newName: "Subjects");

            migrationBuilder.RenameTable(
                name: "Assignment",
                newName: "Assignments");

            migrationBuilder.RenameColumn(
                name: "Submission_Id",
                table: "Rating",
                newName: "SubmissionId");

            migrationBuilder.RenameColumn(
                name: "Person_Id",
                table: "Rating",
                newName: "PersonId");

            migrationBuilder.RenameIndex(
                name: "IX_Rating_Submission_Id",
                table: "Rating",
                newName: "IX_Rating_SubmissionId");

            migrationBuilder.RenameIndex(
                name: "IX_Rating_Person_Id",
                table: "Rating",
                newName: "IX_Rating_PersonId");

            migrationBuilder.RenameColumn(
                name: "Person_Id",
                table: "Submissions",
                newName: "PersonId");

            migrationBuilder.RenameColumn(
                name: "Assignment_Id",
                table: "Submissions",
                newName: "AssignmentId");

            migrationBuilder.RenameIndex(
                name: "IX_Submission_Person_Id",
                table: "Submissions",
                newName: "IX_Submissions_PersonId");

            migrationBuilder.RenameIndex(
                name: "IX_Submission_Assignment_Id",
                table: "Submissions",
                newName: "IX_Submissions_AssignmentId");

            migrationBuilder.RenameColumn(
                name: "Subject_Id",
                table: "Assignments",
                newName: "SubjectId");

            migrationBuilder.RenameColumn(
                name: "Person_Id",
                table: "Assignments",
                newName: "TeacherPersonId");

            migrationBuilder.RenameIndex(
                name: "IX_Assignment_Subject_Id",
                table: "Assignments",
                newName: "IX_Assignments_SubjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Assignment_Person_Id",
                table: "Assignments",
                newName: "IX_Assignments_TeacherPersonId");

            migrationBuilder.AddColumn<decimal>(
                name: "Value",
                table: "Rating",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "AspNetUsers",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(256)",
                oldUnicode: false,
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "SubmissionDate",
                table: "Submissions",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                table: "Submissions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(25)",
                oldUnicode: false,
                oldMaxLength: 25);

            migrationBuilder.AlterColumn<byte[]>(
                name: "FileData",
                table: "Submissions",
                type: "varbinary(max)",
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(1)",
                oldMaxLength: 1);

            migrationBuilder.AddColumn<string>(
                name: "StudentPersonId",
                table: "Submissions",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Subjects",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(25)",
                oldUnicode: false,
                oldMaxLength: 25);

            migrationBuilder.AlterColumn<string>(
                name: "Language",
                table: "Subjects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(25)",
                oldUnicode: false,
                oldMaxLength: 25,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Subjects",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(25)",
                oldUnicode: false,
                oldMaxLength: 25,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Assignments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(25)",
                oldUnicode: false,
                oldMaxLength: 25,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Assignments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(25)",
                oldUnicode: false,
                oldMaxLength: 25);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DueDate",
                table: "Assignments",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Assignments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(500)",
                oldUnicode: false,
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateAssigned",
                table: "Assignments",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime",
                oldDefaultValueSql: "(getdate())");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetUsers",
                table: "AspNetUsers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Submissions",
                table: "Submissions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Subjects",
                table: "Subjects",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Assignments",
                table: "Assignments",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Admin",
                columns: table => new
                {
                    PersonId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admin", x => x.PersonId);
                    table.ForeignKey(
                        name: "FK_Admin_AspNetUsers_PersonId",
                        column: x => x.PersonId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    PersonId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.PersonId);
                    table.ForeignKey(
                        name: "FK_Students_AspNetUsers_PersonId",
                        column: x => x.PersonId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Teachers",
                columns: table => new
                {
                    PersonId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teachers", x => x.PersonId);
                    table.ForeignKey(
                        name: "FK_Teachers_AspNetUsers_PersonId",
                        column: x => x.PersonId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentSubject",
                columns: table => new
                {
                    StudentsPersonId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SubjectsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentSubject", x => new { x.StudentsPersonId, x.SubjectsId });
                    table.ForeignKey(
                        name: "FK_StudentSubject_Students_StudentsPersonId",
                        column: x => x.StudentsPersonId,
                        principalTable: "Students",
                        principalColumn: "PersonId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentSubject_Subjects_SubjectsId",
                        column: x => x.SubjectsId,
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubjectTeacher",
                columns: table => new
                {
                    SubjectsTaughtId = table.Column<int>(type: "int", nullable: false),
                    TeachersPersonId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectTeacher", x => new { x.SubjectsTaughtId, x.TeachersPersonId });
                    table.ForeignKey(
                        name: "FK_SubjectTeacher_Subjects_SubjectsTaughtId",
                        column: x => x.SubjectsTaughtId,
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubjectTeacher_Teachers_TeachersPersonId",
                        column: x => x.TeachersPersonId,
                        principalTable: "Teachers",
                        principalColumn: "PersonId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "443e8aae-b7da-4ba6-ba5a-330fe87ed64d", null, "Student", "STUDENT" },
                    { "57b3e8ba-79b4-4572-901a-33eaf2d9649d", null, "Teacher", "TEACHER" },
                    { "ccaffb10-3ca9-4061-bcca-ee623c3e3975", null, "Admin", "ADMIN" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_StudentPersonId",
                table: "Submissions",
                column: "StudentPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentSubject_SubjectsId",
                table: "StudentSubject",
                column: "SubjectsId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectTeacher_TeachersPersonId",
                table: "SubjectTeacher",
                column: "TeachersPersonId");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignments_Subjects_SubjectId",
                table: "Assignments",
                column: "SubjectId",
                principalTable: "Subjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Assignments_Teachers_TeacherPersonId",
                table: "Assignments",
                column: "TeacherPersonId",
                principalTable: "Teachers",
                principalColumn: "PersonId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Rating_AspNetUsers_PersonId",
                table: "Rating",
                column: "PersonId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Rating_Submissions_SubmissionId",
                table: "Rating",
                column: "SubmissionId",
                principalTable: "Submissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_AspNetUsers_PersonId",
                table: "Submissions",
                column: "PersonId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_Assignments_AssignmentId",
                table: "Submissions",
                column: "AssignmentId",
                principalTable: "Assignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_Students_StudentPersonId",
                table: "Submissions",
                column: "StudentPersonId",
                principalTable: "Students",
                principalColumn: "PersonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignments_Subjects_SubjectId",
                table: "Assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_Assignments_Teachers_TeacherPersonId",
                table: "Assignments");

            migrationBuilder.DropForeignKey(
                name: "FK_Rating_AspNetUsers_PersonId",
                table: "Rating");

            migrationBuilder.DropForeignKey(
                name: "FK_Rating_Submissions_SubmissionId",
                table: "Rating");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_AspNetUsers_PersonId",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_Assignments_AssignmentId",
                table: "Submissions");

            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_Students_StudentPersonId",
                table: "Submissions");

            migrationBuilder.DropTable(
                name: "Admin");

            migrationBuilder.DropTable(
                name: "StudentSubject");

            migrationBuilder.DropTable(
                name: "SubjectTeacher");

            migrationBuilder.DropTable(
                name: "Students");

            migrationBuilder.DropTable(
                name: "Teachers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetUsers",
                table: "AspNetUsers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Submissions",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_StudentPersonId",
                table: "Submissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Subjects",
                table: "Subjects");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Assignments",
                table: "Assignments");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "443e8aae-b7da-4ba6-ba5a-330fe87ed64d");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "57b3e8ba-79b4-4572-901a-33eaf2d9649d");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "ccaffb10-3ca9-4061-bcca-ee623c3e3975");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "StudentPersonId",
                table: "Submissions");

            migrationBuilder.RenameTable(
                name: "Submissions",
                newName: "Submission");

            migrationBuilder.RenameTable(
                name: "Subjects",
                newName: "Subject");

            migrationBuilder.RenameTable(
                name: "Assignments",
                newName: "Assignment");

            migrationBuilder.RenameColumn(
                name: "SubmissionId",
                table: "Rating",
                newName: "Submission_Id");

            migrationBuilder.RenameColumn(
                name: "PersonId",
                table: "Rating",
                newName: "Person_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Rating_SubmissionId",
                table: "Rating",
                newName: "IX_Rating_Submission_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Rating_PersonId",
                table: "Rating",
                newName: "IX_Rating_Person_Id");

            migrationBuilder.RenameColumn(
                name: "PersonId",
                table: "Submission",
                newName: "Person_Id");

            migrationBuilder.RenameColumn(
                name: "AssignmentId",
                table: "Submission",
                newName: "Assignment_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Submissions_PersonId",
                table: "Submission",
                newName: "IX_Submission_Person_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Submissions_AssignmentId",
                table: "Submission",
                newName: "IX_Submission_Assignment_Id");

            migrationBuilder.RenameColumn(
                name: "SubjectId",
                table: "Assignment",
                newName: "Subject_Id");

            migrationBuilder.RenameColumn(
                name: "TeacherPersonId",
                table: "Assignment",
                newName: "Person_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Assignments_TeacherPersonId",
                table: "Assignment",
                newName: "IX_Assignment_Person_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Assignments_SubjectId",
                table: "Assignment",
                newName: "IX_Assignment_Subject_Id");

            migrationBuilder.AddColumn<decimal>(
                name: "Rating",
                table: "Rating",
                type: "numeric(28,0)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "AspNetUsers",
                type: "varchar(256)",
                unicode: false,
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "SubmissionDate",
                table: "Submission",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                table: "Submission",
                type: "varchar(25)",
                unicode: false,
                maxLength: 25,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<byte[]>(
                name: "FileData",
                table: "Submission",
                type: "varbinary(1)",
                maxLength: 1,
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "varbinary(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Subject",
                type: "varchar(25)",
                unicode: false,
                maxLength: 25,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Language",
                table: "Subject",
                type: "varchar(25)",
                unicode: false,
                maxLength: 25,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Subject",
                type: "varchar(25)",
                unicode: false,
                maxLength: 25,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Assignment",
                type: "varchar(25)",
                unicode: false,
                maxLength: 25,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "Assignment",
                type: "varchar(25)",
                unicode: false,
                maxLength: 25,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DueDate",
                table: "Assignment",
                type: "datetime",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Assignment",
                type: "varchar(500)",
                unicode: false,
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateAssigned",
                table: "Assignment",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getdate())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddPrimaryKey(
                name: "Person_PK",
                table: "AspNetUsers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "Submission_PK",
                table: "Submission",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "Subject_PK",
                table: "Subject",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "Assignment_PK",
                table: "Assignment",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "PersonSubject",
                columns: table => new
                {
                    Person_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Subject_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PersonSubject_PK", x => new { x.Person_Id, x.Subject_Id });
                    table.ForeignKey(
                        name: "PersonSubject_Person_FK",
                        column: x => x.Person_Id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "PersonSubject_Subject_FK",
                        column: x => x.Subject_Id,
                        principalTable: "Subject",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "6f23b961-528d-4483-91dc-9a05798706bc", null, "Teacher", "TEACHER" },
                    { "b609f91d-aea7-4ca7-a8f9-21d151250296", null, "Student", "STUDENT" },
                    { "e9f5985b-6dbf-4290-8fff-8903993d65d8", null, "Admin", "ADMIN" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonSubject_Subject_Id",
                table: "PersonSubject",
                column: "Subject_Id");

            migrationBuilder.AddForeignKey(
                name: "Assignment_Person_FK",
                table: "Assignment",
                column: "Person_Id",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "Assignment_Subject_FK",
                table: "Assignment",
                column: "Subject_Id",
                principalTable: "Subject",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "Rating_Person_FK",
                table: "Rating",
                column: "Person_Id",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "Rating_Submission_FK",
                table: "Rating",
                column: "Submission_Id",
                principalTable: "Submission",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "Submission_Assignment_FK",
                table: "Submission",
                column: "Assignment_Id",
                principalTable: "Assignment",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "Submission_Person_FK",
                table: "Submission",
                column: "Person_Id",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
