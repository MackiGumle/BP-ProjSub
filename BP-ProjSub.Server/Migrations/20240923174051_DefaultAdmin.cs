using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BP_ProjSub.Server.Migrations
{
    /// <inheritdoc />
    public partial class DefaultAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "5345c0ac-5a12-44e9-b5dc-01b5393ae0fd");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "66734ecd-38f5-4f5e-98a5-7d3a8e9fcfce");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "ce9bf8ac-ad0b-4db0-a867-64d7b877d21c");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                    { "5345c0ac-5a12-44e9-b5dc-01b5393ae0fd", null, "Teacher", "TEACHER" },
                    { "66734ecd-38f5-4f5e-98a5-7d3a8e9fcfce", null, "Student", "STUDENT" },
                    { "ce9bf8ac-ad0b-4db0-a867-64d7b877d21c", null, "Admin", "ADMIN" }
                });
        }
    }
}
