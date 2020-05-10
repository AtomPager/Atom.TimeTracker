using Microsoft.EntityFrameworkCore.Migrations;

namespace Atoms.Time.Migrations
{
    public partial class vw_TimePeriodSummary : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE VIEW vw_TimePeriodSummary AS
SELECT TimePeriods.Id
	 , PeriodStartDate
	 , PeriodEndDate
	 , WorkDays
	 , IIF(PeriodEndDate < GetUtcDate(), 'Prior', IIF(PeriodStartDate >GetUtcDate(), 'Future', 'Current')) AS [Status]
	 , ISNULL([NotStarted],0) AS [NotStarted]
	 , ISNull([NotSubmitted],0) AS [NotSubmitted]
	 , ISNULL([Complete],0) as [Complete]
FROM TimePeriods
OUTER APPLY
(
SELECT ISNULL([NotStarted],0) AS [NotStarted], ISNULL([NotSubmitted],0) AS [NotSubmitted], ISNULL([Complete],0) as [Complete] FROM 
(
	SELECT [Status], COUNT(*) as [count]
	FROM
	(
		SELECT CASE
			WHEN TimeSheets.id IS NULL then 'NotStarted'
			WHEN TimeSheets.SubmittedDateTime IS NULL then 'NotSubmitted'
			ELSE 'Complete' END AS [Status]
		FROM Persons 
		FULL OUTER JOIN TimeSheets ON TimeSheets.timePeriodId = timePeriods.Id AND Persons.Id = TimeSheets.PersonId
		where persons.id IS NOT NULL AND (TimeSheets.Id IS NOT NULL OR (Persons.IsActive = 1 and Persons.startDate <= TimePeriods.PeriodEndDate))
	) AS D
	GROUP BY [Status]
) as src
PIVOT(
	SUM([COUNT]) FOR Status in ([NotStarted],[NotSubmitted],[Complete] )
	) AS t
) AS statusCount
                ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP VIEW vw_TimePeriodSummary");
		}
    }
}
