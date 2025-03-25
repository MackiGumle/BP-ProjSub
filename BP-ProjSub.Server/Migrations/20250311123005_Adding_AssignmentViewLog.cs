using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BP_ProjSub.Server.Migrations
{
    /// <inheritdoc />
    public partial class Adding_AssignmentViewLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AssignmentViewLog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssignmentId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IpAddress = table.Column<string>(type: "varchar(45)", unicode: false, maxLength: 45, nullable: false),
                    ViewedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentViewLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentViewLog_Assignment_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentViewLog_Students_UserId",
                        column: x => x.UserId,
                        principalTable: "Students",
                        principalColumn: "PersonId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentViewLog_AssignmentId",
                table: "AssignmentViewLog",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentViewLog_UserId",
                table: "AssignmentViewLog",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssignmentViewLog");
        }
    }
}
