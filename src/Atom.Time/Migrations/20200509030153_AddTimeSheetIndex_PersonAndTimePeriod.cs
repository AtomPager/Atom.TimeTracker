using Microsoft.EntityFrameworkCore.Migrations;

namespace Atom.Time.Migrations
{
    public partial class AddTimeSheetIndex_PersonAndTimePeriod : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimeSheets_TimePeriodId",
                table: "TimeSheets");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheets_TimePeriodId_PersonId",
                table: "TimeSheets",
                columns: new[] { "TimePeriodId", "PersonId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimeSheets_TimePeriodId_PersonId",
                table: "TimeSheets");

            migrationBuilder.CreateIndex(
                name: "IX_TimeSheets_TimePeriodId",
                table: "TimeSheets",
                column: "TimePeriodId");
        }
    }
}
