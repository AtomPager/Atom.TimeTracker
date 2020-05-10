using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Atom.TimeTracker.Helpers
{
    public static class DateTimeExtensions
    {
        public static DateTime ToStartOfMonth(this DateTime date)
        {
            return new DateTime(date.Year, date.Month, 1);
        }

        public static DateTime ToEndOfMonth(this DateTime date)
        {
            return date.ToStartOfMonth().AddMonths(1).AddDays(-1);
        }
    }
}
