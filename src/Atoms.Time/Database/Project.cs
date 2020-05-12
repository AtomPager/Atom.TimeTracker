using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Atoms.Time.Database
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public string KeyWords { get; set; }

        /// <summary>
        /// Indicates that a project should be tracked as an Research and Development project
        /// </summary>
        public bool IsRnD { get; set; }

        public string Group { get; set; }
        public string Classification { get; set; }

        /// <summary>
        /// Indicates that a project shouldn't be used for new time sheets.
        /// </summary>
        /// <remarks>
        /// This project will only be visible to user when they search for it,
        /// and should display a warning to the user if they try to use it.
        /// They are still allowed to add it to a time sheet.
        /// </remarks>
        public bool IsArchived { get; set; }

        /// <summary>
        /// Indicates that a project should be shown in the project dropdown unless the user is searching from something specific.
        /// </summary>
        public bool ShowByDefault { get; set; }

        [JsonIgnore] public List<TimeSheetEntry> TimeSheetEntries { get; set; }
    }
}
