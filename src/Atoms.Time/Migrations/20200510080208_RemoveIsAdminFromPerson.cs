using Microsoft.EntityFrameworkCore.Migrations;

namespace Atoms.Time.Migrations
{
    public partial class RemoveIsAdminFromPerson : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAdmin",
                table: "Persons");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "Persons",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
