using Microsoft.EntityFrameworkCore.Migrations;

namespace Atom.TimeTracker.Migrations
{
    public partial class vw_PersonTimeSheets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE VIEW vw_PersonTimeSheets AS

SELECT Persons.id AS PersonId, Name, UserName, IsActive, StartDate, tp.*, DATEDIFF(day,ISNULL(SubmittedDateTime, GetUtcDate()), PeriodEndDate) as DueInDays
FROM Persons 
CROSS APPLY(
	SELECT TimePeriods.Id as TimePeriodId, PeriodStartDate, PeriodEndDate, WorkDays, TimeSheets.Id as TimeSheetId, TimeSheets.SubmittedDateTime
	FROM TimePeriods
	LEFT JOIN TimeSheets ON TimeSheets.PersonId = Persons.Id AND TimeSheets.TimePeriodId = TimePeriods.Id
	WHERE TimePeriods.PeriodStartDate >= Persons.StartDate OR (TimeSheets.Id IS NOT NULL AND SubmittedDateTime IS NOT NULL)
) AS TP");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP VIEW vw_PersonTimeSheets");
        }
    }
}
