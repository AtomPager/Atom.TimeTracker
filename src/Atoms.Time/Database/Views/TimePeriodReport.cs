using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Atoms.Time.Database.Views
{
    public class TimePeriodReport
    {
        public int TimePeriodId { get; set; }
        public string ProjectName { get; set; }
        public string ProjectClassification { get; set; }
        public string ProjectGroup { get; set; }
        public string PersonName { get; set; }
        public int PersonId { get; set; }
        public double PercentOfPeriod { get; set; }
    }
}
