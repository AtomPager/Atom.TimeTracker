using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Atom.Time.Migrations
{
    public partial class ChangeDateOnlyFieldsToDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "SubmittedDateTime",
                table: "TimeSheets",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "PeriodStartDate",
                table: "TimePeriods",
                type: "DATE",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PeriodEndDate",
                table: "TimePeriods",
                type: "DATE",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "Persons",
                type: "DATE",
                nullable: false,
                defaultValueSql: "GetUtcDate()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GetUtcDate()");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "SubmittedDateTime",
                table: "TimeSheets",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "PeriodStartDate",
                table: "TimePeriods",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "DATE");

            migrationBuilder.AlterColumn<DateTime>(
                name: "PeriodEndDate",
                table: "TimePeriods",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "DATE");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "Persons",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GetUtcDate()",
                oldClrType: typeof(DateTime),
                oldType: "DATE",
                oldDefaultValueSql: "GetUtcDate()");
        }
    }
}
