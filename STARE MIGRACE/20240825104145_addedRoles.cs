using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BP_ProjSub.Server.Migrations
{
    /// <inheritdoc />
    public partial class addedRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "6f23b961-528d-4483-91dc-9a05798706bc", null, "Teacher", "TEACHER" },
                    { "b609f91d-aea7-4ca7-a8f9-21d151250296", null, "Student", "STUDENT" },
                    { "e9f5985b-6dbf-4290-8fff-8903993d65d8", null, "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
