using System;

namespace Atom.TimeTracker.Database
{
    public class TimePeriodSummary
    {
        public int Id { get; set; }
        public DateTime PeriodStartDate { get; set; }

        /// <summary>
        /// End date of Period, inclusive
        /// </summary>
        public DateTime PeriodEndDate { get; set; }

        public int WorkDays { get; set; }

        public string Status { get; set; }
        public int NotStarted { get; set; }
        public int NotSubmitted { get; set; }
        public int Complete { get; set; }
    }
}