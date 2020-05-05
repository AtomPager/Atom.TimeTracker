using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Atom.TimeTracker.Database
{
    public class TimeSheet
    {
        public int Id { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)] public TimePeriod TimePeriod { get; set; }
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)] public Person Person { get; set; }
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)] public List<TimeSheetEntry> Entries { get; set; }

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