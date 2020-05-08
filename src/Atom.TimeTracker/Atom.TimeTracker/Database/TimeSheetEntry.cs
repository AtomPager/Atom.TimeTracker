using System.Text.Json.Serialization;

namespace Atom.TimeTracker.Database
{
    public class TimeSheetEntry
    {
        public int Id { get; set; }
        public Project Project { get; set; }
        [JsonIgnore] public TimeSheet TimeSheet { get; set; }
        [JsonIgnore] public int? ProjectId { get; set; }
        [JsonIgnore] public int TimeSheetId { get; set; }
        
        public string Note { get; set; }

        /// <summary>
        /// This value given my the person representing the part count they spend on this project during the period
        /// </summary>
        public double Value { get; set; }

        /// <summary>
        /// The computed percent of the period that the person spent on this project.
        /// </summary>
        public double PercentOfPeriod { get; set; }
    }
}