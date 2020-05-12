using Microsoft.EntityFrameworkCore.Migrations;

namespace Atoms.Time.Migrations
{
    public partial class AddKeyWordsToProduct : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KeyWords",
                table: "Projects",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KeyWords",
                table: "Projects");
        }
    }
}
