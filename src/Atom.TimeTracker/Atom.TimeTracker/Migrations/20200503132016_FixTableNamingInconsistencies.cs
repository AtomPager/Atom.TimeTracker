using Microsoft.EntityFrameworkCore.Migrations;

namespace Atom.TimeTracker.Migrations
{
    public partial class FixTableNamingInconsistencies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeSheets_TimePeriod_TimePeriodId",
                table: "TimeSheets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TimePeriod",
                table: "TimePeriod");

            migrationBuilder.RenameTable(
                name: "TimePeriod",
                newName: "TimePeriods");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TimePeriods",
                table: "TimePeriods",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeSheets_TimePeriods_TimePeriodId",
                table: "TimeSheets",
                column: "TimePeriodId",
                principalTable: "TimePeriods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeSheets_TimePeriods_TimePeriodId",
                table: "TimeSheets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TimePeriods",
                table: "TimePeriods");

            migrationBuilder.RenameTable(
                name: "TimePeriods",
                newName: "TimePeriod");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TimePeriod",
                table: "TimePeriod",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeSheets_TimePeriod_TimePeriodId",
                table: "TimeSheets",
                column: "TimePeriodId",
                principalTable: "TimePeriod",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
