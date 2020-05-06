using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

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
        public DateTimeOffset? SubmittedDateTime { get; set; }

        [JsonIgnore]
        public int TimePeriodId { get; set; }
        [JsonIgnore]
        public int PersonId { get; set; }
    }
}