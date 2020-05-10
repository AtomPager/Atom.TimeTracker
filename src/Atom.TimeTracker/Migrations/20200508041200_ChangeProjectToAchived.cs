using Microsoft.EntityFrameworkCore.Migrations;

namespace Atom.TimeTracker.Migrations
{
    public partial class ChangeProjectToAchived : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsObsolete",
                table: "Projects");

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Projects",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Projects");

            migrationBuilder.AddColumn<bool>(
                name: "IsObsolete",
                table: "Projects",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
