using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Atom.TimeTracker.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atom.TimeTracker.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeSheetController : ControllerBase
    {
        private readonly TimeSheetContext _context;

        public TimeSheetController(TimeSheetContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IEnumerable<PersonTimeSheets>> GetTimeSheet(bool showAll = false)
        {
            var query = _context.PersonTimeSheets.AsNoTracking()
                .Where(p => p.UserName == UserName);

            if (!showAll)
            {
                query = query.Where(p =>
                    p.PeriodStartDate < DateTime.UtcNow.AddDays(20) &&
                    (p.PeriodEndDate > DateTime.UtcNow.AddMonths(-6) || p.SubmittedDateTime == null));
            }
            
            return await query
                .OrderByDescending(p => p.PeriodEndDate)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TimeSheet>> GetTimeSheet(int id)
        {
            var timeSheet = await _context.TimeSheets
                .AsNoTracking()
                .Include(t => t.TimePeriod)
                .Include(t => t.Entries)
                .FirstOrDefaultAsync(t => t.Person.UserName == UserName && t.Id == id);
            
            if (timeSheet == null)
                return NotFound();

            timeSheet.TimePeriod.TimeSheets = null;
            return Ok(timeSheet);
        }

        [HttpPost]
        public async Task<ActionResult<TimeSheet>> Create(TimeSheetCreate create)
        {
            var user = UserName;
            var timePeriod = await _context.TimePeriods.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == create.TimePeriodId);

            if (timePeriod == null)
                return BadRequest("Time Period specified was not found");

            var person = await _context.Persons.AsNoTracking().FirstOrDefaultAsync(p => p.UserName == user && p.IsActive);
            if (person == null)
            {
                return BadRequest("Need to be an active user to create time sheets");
            }

            var timeSheet = await _context.TimeSheets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Person.UserName == user && t.TimePeriodId == timePeriod.Id);

            // If the time sheet for the period doesn't already exist, then create it.
            if (timeSheet == null)
            {
                timeSheet = new TimeSheet
                {
                    PersonId = person.Id,
                    TimePeriodId = timePeriod.Id
                };

                await _context.TimeSheets.AddAsync(timeSheet);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction("GetTimeSheet", new { id = timeSheet.Id }, timeSheet);
        }

        public class TimeSheetCreate
        {
            public int TimePeriodId { get; set; }
        }

        private string UserName
        {
            get
            {
                var name = User?.Identity?.Name ?? "TestUser"; // TODO: Remove once Auth is added.
                if (string.IsNullOrEmpty(name))
                    throw new ApplicationException("No user defined");
                return name;
            }
        }
    }
}