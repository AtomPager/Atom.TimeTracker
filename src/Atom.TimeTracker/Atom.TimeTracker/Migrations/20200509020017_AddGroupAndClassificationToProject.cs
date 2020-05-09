using Microsoft.EntityFrameworkCore.Migrations;

namespace Atom.TimeTracker.Migrations
{
    public partial class AddGroupAndClassificationToProject : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Classification",
                table: "Projects",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Group",
                table: "Projects",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Classification",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Group",
                table: "Projects");
        }
    }
}
