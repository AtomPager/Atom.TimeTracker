using Microsoft.EntityFrameworkCore.Migrations;

namespace Atom.Time.Migrations
{
    public partial class MakeProjectOptionalOnTimeSheetEntry : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "TimeSheetEntries",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "TimeSheetEntries",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);
        }
    }
}
