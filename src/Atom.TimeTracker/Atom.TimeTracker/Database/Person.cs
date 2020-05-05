using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Atom.TimeTracker.Database
{
    public class Person
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)] public List<TimeSheet> TimeSheets { get; set; }

        /// <summary>
        /// Indicates this person is an Administrator of the time sheet system and has extra roles the can perform.
        /// </summary>
        public bool IsAdmin { get; set; }

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
        public DateTime StartDate { get; set; }
    }
}