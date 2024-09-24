using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BP_ProjSub.Server.Migrations
{
    /// <inheritdoc />
    public partial class DefaultAdminActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "117a6df4-4d0f-48b1-a596-a7d431a43ae1");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "76fe5145-7b2c-4bc2-b8ee-c27ef344f476");

            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "RoleId", "UserId" },
                keyValues: new object[] { "a97b9618-88c8-4aed-8bb6-996ff15b3e79", "88fc0b4e-2d43-4179-ba19-9b58b75e6375" });

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a97b9618-88c8-4aed-8bb6-996ff15b3e79");

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "88fc0b4e-2d43-4179-ba19-9b58b75e6375");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "117a6df4-4d0f-48b1-a596-a7d431a43ae1", null, "Student", "STUDENT" },
                    { "76fe5145-7b2c-4bc2-b8ee-c27ef344f476", null, "Teacher", "TEACHER" },
                    { "a97b9618-88c8-4aed-8bb6-996ff15b3e79", null, "Admin", "ADMIN" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[] { "88fc0b4e-2d43-4179-ba19-9b58b75e6375", 0, "b2f7db39-11af-4f4e-8f99-9e46140a8d27", "admin@example.com", false, false, null, "ADMIN@EXAMPLE.COM", "ADMIN", "AQAAAAIAAYagAAAAEHtI5/2Mr8sAadnv80Omjmh27lBqd3j2mfpQNlRgyWm3uI6/8dhT7xOjSgcVfgG6VA==", null, false, "13135bb4-daef-40cc-b6b6-f892f71cfef1", false, "Admin" });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "a97b9618-88c8-4aed-8bb6-996ff15b3e79", "88fc0b4e-2d43-4179-ba19-9b58b75e6375" });
        }
    }
}
