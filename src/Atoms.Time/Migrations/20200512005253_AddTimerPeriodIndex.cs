using Microsoft.EntityFrameworkCore.Migrations;

namespace Atoms.Time.Migrations
{
    public partial class AddTimerPeriodIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TimePeriods_PeriodEndDate_PeriodStartDate",
                table: "TimePeriods",
                columns: new[] { "PeriodEndDate", "PeriodStartDate" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimePeriods_PeriodEndDate_PeriodStartDate",
                table: "TimePeriods");
        }
    }
}
