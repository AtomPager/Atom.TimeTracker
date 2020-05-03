using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Atom.TimeTracker.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atom.TimeTracker.Controllers.Api.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    // TODO: Add check for Admin Role.
    public class TimePeriodsController : ControllerBase
    {
        private readonly TimeSheetContext _context;

        public TimePeriodsController(TimeSheetContext context)
        {
            _context = context;
        }

        // GET: api/TimePeriods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TimePeriod>>> GetTimePeriod()
        {
            return await _context.TimePeriod.AsNoTracking().OrderByDescending(t=>t.PeriodStartDate).ToListAsync();
        }

        [HttpGet("SuggestTimes")]
        public async Task<ActionResult<TimePeriodCreate>> GetSuggestedTimePeriod()
        {
            try
            {
                var currentLastPeriod = await _context.TimePeriod.AsNoTracking().MaxAsync(t => t.PeriodEndDate);
                currentLastPeriod = currentLastPeriod.AddDays(1);
                return new TimePeriodCreate { StartDate = currentLastPeriod, EndDate = currentLastPeriod.AddMonths(1).AddDays(-1) };
            }
            catch (InvalidOperationException e)
            {
                var now = DateTime.Now;
                var som = new DateTime(now.Year, now.Month, 1);
                return new TimePeriodCreate { StartDate = som, EndDate = som.AddMonths(1).AddDays(-1) };
            }
        }

        // GET: api/TimePeriods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TimePeriod>> GetTimePeriod(int id)
        {
            var timePeriod = await _context.TimePeriod.AsNoTracking()
                .Include(p => p.TimeSheets)
                .Include(p => p.TimeSheets.First().Person)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (timePeriod == null)
            {
                return NotFound();
            }

            return timePeriod;
        }

        // POST: api/TimePeriods
        [HttpPost]
        public async Task<ActionResult<TimePeriod>> PostTimePeriod(TimePeriodCreate period)
        {
            if (!period.StartDate.HasValue)
            {
                var lastEndDate = await _context.TimePeriod.MaxAsync(t => t.PeriodEndDate);
                
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

            if (await _context.TimePeriod.AnyAsync(OverlapPredicate(startDate, endDate)))
            {
                return Conflict("Overlapping time period found");
            }

            var timePeriod = new TimePeriod
            {
                PeriodEndDate = endDate,
                PeriodStartDate = startDate
            };

            await _context.TimePeriod.AddAsync(timePeriod);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTimePeriod", new { id = timePeriod.Id }, timePeriod);
        }

        public static Expression<Func<TimePeriod, bool>> OverlapPredicate(DateTime startDate, DateTime endDate)
        {
            return t =>
                (t.PeriodStartDate <= startDate && t.PeriodEndDate >= endDate) // We are with-in an existing time sheet
                || (t.PeriodStartDate <= startDate && t.PeriodEndDate >= startDate)  // we start before an existing time sheet ends
                || (t.PeriodStartDate <= endDate && t.PeriodEndDate >= endDate)
                || (t.PeriodStartDate >= startDate && t.PeriodEndDate <= endDate);
        }

        // DELETE: api/TimePeriods/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<TimePeriod>> DeleteTimePeriod(int id)
        {
            var timePeriod = await _context.TimePeriod.FindAsync(id);
            if (timePeriod == null)
            {
                return NotFound();
            }

            _context.TimePeriod.Remove(timePeriod);
            await _context.SaveChangesAsync();

            return timePeriod;
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
    }
}
