using System;
using System.Collections.Generic;

namespace Atom.TimeTracker.Database
{
    public class TimeSheet
    {
        public int Id { get; set; }
        public TimePeriod TimePeriod { get; set; }
        public Person Person { get; set; }
        public List<TimeSheetEntry> Entries { get; set; }

        /// <summary>
        /// Represent the date and time this time sheet was submitted, if value is null, then it hasn't been submitted yet.
        /// </summary>
        public DateTime? SubmittedDateTime { get; set; }
    }
}