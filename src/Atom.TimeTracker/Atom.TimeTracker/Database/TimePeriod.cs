using System;
using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace Atom.TimeTracker.Database
{
    public class TimePeriod
    {
        public int Id { get; set; }
        public DateTime PeriodStartDate { get; set; }

        /// <summary>
        /// End date of Period, inclusive
        /// </summary>
        public DateTime PeriodEndDate { get; set; }
        public int WorkDays { get; set; }
        [JsonIgnore] public List<TimeSheet> TimeSheets { get; set; }
    }
}
