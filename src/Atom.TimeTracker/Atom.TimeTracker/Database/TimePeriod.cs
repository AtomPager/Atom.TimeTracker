using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

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
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)] public List<TimeSheet> TimeSheets { get; set; }
    }
}
