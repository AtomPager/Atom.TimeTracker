using System;

namespace Atom.TimeTracker.Database
{
    /// <summary>
    /// The status of all time sheets for a given person
    /// </summary>
    public class PersonTimeSheets
    {
        public int PersonId { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public bool IsActive { get; set; }

        /// <summary>
        /// This person was not required to fill out time sheets prior to this date.
        /// </summary>
        /// <remarks>
        /// This will remove this person from delinquent reporting for time periods prior to this date.
        /// </remarks>
        /// 
        public DateTime StartDate { get; set; }
        public int TimePeriodId { get; set; }
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }
        public int WorkDays { get; set; }
        public int? TimeSheetId { get; set; }
        public DateTimeOffset? SubmittedDateTime { get; set; }
        public int DueInDays { get; set; }
    }

    /// <summary>
    /// The status of people for a given time period
    /// </summary>
    public class PersonsTimeSheets
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }

        /// <summary>
        /// Indicates if this person should be actively filling out time sheets.
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// This person was not required to fill out time sheets prior to this date.
        /// </summary>
        /// <remarks>
        /// This will remove this person from delinquent reporting for time periods prior to this date.
        /// </remarks>
        /// 
        public DateTime StartDate { get; set; }
        public int? TimeSheetId { get; set; }
        public DateTimeOffset? SubmittedDateTime { get; set; }
    }
}