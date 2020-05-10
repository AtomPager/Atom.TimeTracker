using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Atoms.Time.Database;
using Atoms.Time.Database.Views;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atoms.Time.Controllers.Api.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(AuthPolicy.Administrator)]
    public class TimePeriodsController : ControllerBase
    {
        private readonly TimeSheetContext _context;

        public TimePeriodsController(TimeSheetContext context)
        {
            _context = context;
        }

        // GET: api/admin/TimePeriods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TimePeriodSummary>>> GetTimePeriod()
        {
            return await _context.TimePeriodSummary.AsNoTracking().OrderByDescending(t => t.PeriodStartDate).ToListAsync();
        }

        [HttpGet("SuggestTimes")]
        public async Task<ActionResult<TimePeriodCreate>> GetSuggestedTimePeriod()
        {
            var now = DateTime.Now;
            var startOfPeriod = new DateTime(now.Year, now.Month, 1);

            try
            {
                var currentLastPeriod = await _context.TimePeriods.AsNoTracking().MaxAsync(t => t.PeriodEndDate);
                startOfPeriod = currentLastPeriod.AddDays(1); // end dates are inclusive, so we want to start on the next day.
            }
            catch (InvalidOperationException)
            {
            }

            var periodEnd = startOfPeriod.AddMonths(1).AddDays(-1); // TODO; make the default period duration configurable
            return new TimePeriodCreate { StartDate = startOfPeriod, EndDate = periodEnd };
        }

        // GET: api/admin/TimePeriods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TimePeriodDetails>> GetTimePeriod(int id)
        {
            var timePeriod = await _context.TimePeriods.AsNoTracking().SingleOrDefaultAsync(t => t.Id == id);
            if (timePeriod == null)
            {
                return NotFound();
            }

            var persons = await _context.PersonTimeSheets.Where(d => d.TimePeriodId == id && d.IsActive).ToListAsync();

            return new TimePeriodDetails
            {
                TimePeriod = timePeriod,
                Persons = persons
            };
        }

        // POST: api/admin/TimePeriods
        [HttpPost]
        public async Task<ActionResult<TimePeriod>> PostTimePeriod(TimePeriodCreate period)
        {
            if (!period.StartDate.HasValue)
            {
                var lastEndDate = await _context.TimePeriods.MaxAsync(t => t.PeriodEndDate);

                // Don't auto fill start date if it would create a period over longer then 3 months.
                if (lastEndDate.AddMonths(-3) < period.EndDate)
                    return BadRequest("Unable to auto fill start date");

                // Use the last end date, but add 1 day because end dates are inclusive in the period.
                period.StartDate = lastEndDate.AddDays(1);
            }

            var startDate = period.StartDate.Value.Date;
            var endDate = period.EndDate.Date;
            if (startDate >= endDate)
                return BadRequest("Start date must be before end date");

            if (await _context.TimePeriods.AnyAsync(OverlapPredicate(startDate, endDate)))
            {
                return Conflict("Overlapping time period found");
            }

            // TODO: Update work days to remove weekends
            // TODO: Add holiday schedule to taken into account for work days.
            var workDays = (int)(endDate - startDate).TotalDays;

            var timePeriod = new TimePeriod
            {
                PeriodEndDate = endDate,
                PeriodStartDate = startDate,
                WorkDays = workDays
            };

            await _context.TimePeriods.AddAsync(timePeriod);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTimePeriod", new { id = timePeriod.Id }, timePeriod);
        }

        // DELETE: api/admin/TimePeriods/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<TimePeriod>> DeleteTimePeriod(int id)
        {
            var timePeriod = await _context.TimePeriods.FindAsync(id);
            if (timePeriod == null)
            {
                return NotFound();
            }

            _context.TimePeriods.Remove(timePeriod);
            await _context.SaveChangesAsync();

            return timePeriod;
        }

        public static Expression<Func<TimePeriod, bool>> OverlapPredicate(DateTime startDate, DateTime endDate)
        {
            return t =>
                (t.PeriodStartDate <= startDate && t.PeriodEndDate >= endDate) // We are with-in an existing time sheet
                || (t.PeriodStartDate <= startDate && t.PeriodEndDate >= startDate)  // we start before an existing time sheet ends
                || (t.PeriodStartDate <= endDate && t.PeriodEndDate >= endDate)
                || (t.PeriodStartDate >= startDate && t.PeriodEndDate <= endDate);
        }

        public class TimePeriodCreate
        {
            /// <summary>
            /// The first day of the time period, if null the system will look back up to 3 months and use the last end date.
            /// </summary>
            public DateTime? StartDate { get; set; }

            /// <summary>
            /// End date of Period, inclusive
            /// </summary>
            public DateTime EndDate { get; set; }
        }

        public class TimePeriodDetails
        {
            public TimePeriod TimePeriod { get; set; }
            public List<PersonTimeSheets> Persons { get; set; }
        }
    }
}
