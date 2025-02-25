using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BP_ProjSub.Server.Migrations
{
    /// <inheritdoc />
    public partial class Adding_SubmissionComment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "32a8b951-9926-4def-8e77-3248e75443ac");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e57aed6a-ef40-4b9b-91c1-8928e114f11d");

            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "a447f8fe-1b39-46a3-8c49-c8e80f13f2dc", "62d9f896-a700-46f5-acf5-b42953b79c8d" });

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a447f8fe-1b39-46a3-8c49-c8e80f13f2dc");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "62d9f896-a700-46f5-acf5-b42953b79c8d");

            migrationBuilder.CreateTable(
                name: "SubmissionComment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LineCommented = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PersonId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SubmissionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmissionComment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubmissionComment_Submission_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "Submission",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubmissionComment_Teacher_PersonId",
                        column: x => x.PersonId,
                        principalTable: "Teacher",
                        principalColumn: "PersonId");
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "076d001b-f25d-4546-8507-e42d5415fa3d", null, "Student", "STUDENT" },
                    { "a1eed8ea-58bf-40a9-9578-26352aaf20a9", null, "Admin", "ADMIN" },
                    { "f5a297a0-7411-41eb-9b68-cbfa7c90c1b2", null, "Teacher", "TEACHER" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[] { "3324d9a7-35c9-4ea6-86a5-3855e791cc48", 0, "dfa50993-4e4e-407f-8563-4a08b6e9d255", "admin@example.com", true, false, null, "ADMIN@EXAMPLE.COM", "ADMIN", "AQAAAAIAAYagAAAAEB+VJ2mauzpimrheQNghjGhn2/qt9lDcjn0bsJYkqZNDMN5yvoonWqFZ8LHW1RVdQg==", null, false, "7f108645-b982-4fb4-9c45-699676f5b00b", false, "Admin" });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "a1eed8ea-58bf-40a9-9578-26352aaf20a9", "3324d9a7-35c9-4ea6-86a5-3855e791cc48" });

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionComment_PersonId",
                table: "SubmissionComment",
                column: "PersonId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionComment_SubmissionId",
                table: "SubmissionComment",
                column: "SubmissionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubmissionComment");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "076d001b-f25d-4546-8507-e42d5415fa3d");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "f5a297a0-7411-41eb-9b68-cbfa7c90c1b2");

            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "a1eed8ea-58bf-40a9-9578-26352aaf20a9", "3324d9a7-35c9-4ea6-86a5-3855e791cc48" });

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a1eed8ea-58bf-40a9-9578-26352aaf20a9");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "3324d9a7-35c9-4ea6-86a5-3855e791cc48");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "32a8b951-9926-4def-8e77-3248e75443ac", null, "Student", "STUDENT" },
                    { "a447f8fe-1b39-46a3-8c49-c8e80f13f2dc", null, "Admin", "ADMIN" },
                    { "e57aed6a-ef40-4b9b-91c1-8928e114f11d", null, "Teacher", "TEACHER" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[] { "62d9f896-a700-46f5-acf5-b42953b79c8d", 0, "b397006e-8487-4ade-8257-7b6c1f197681", "admin@example.com", true, false, null, "ADMIN@EXAMPLE.COM", "ADMIN", "AQAAAAIAAYagAAAAEPZZ7a5EWZ1jdG2coyhyvrNsBbsL3O6LFA8aT1Ev/b8uD7eaS8wfLZmia5Cl2BuqZg==", null, false, "f3050010-78e5-410b-9ce0-4fa833e7beae", false, "Admin" });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "a447f8fe-1b39-46a3-8c49-c8e80f13f2dc", "62d9f896-a700-46f5-acf5-b42953b79c8d" });
        }
    }
}
