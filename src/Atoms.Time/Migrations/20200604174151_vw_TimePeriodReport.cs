using Microsoft.EntityFrameworkCore.Migrations;

namespace Atoms.Time.Migrations
{
    public partial class vw_TimePeriodReport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE VIEW vw_TimePeriodReport AS

SELECT Ts.TimePeriodId, p.[Name] AS ProjectName, ISNULL(p.[Classification],'') AS ProjectClassification, ISNULL(p.[Group],'') AS ProjectGroup, persons.Name AS PersonName, Persons.Id AS PersonId, sum(Tse.[PercentOfPeriod]) as [PercentOfPeriod]
  FROM [TimeSheetEntries] AS Tse
  JOIN TimeSheets AS Ts ON Tse.TimeSheetId = Ts.Id
  JOIN Projects as P on Tse.ProjectId = p.Id
  JOIN Persons on Persons.Id = ts.PersonId
  GROUP by Ts.TimePeriodId, p.[Name], p.[Classification], p.[Group], persons.Name, Persons.Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP VIEW vw_TimePeriodReport");
        }
    }
}
