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
        public async Task<IEnumerable<TimeSheet>> GetTimeSheet()
        {
            return await _context.TimeSheets.AsNoTracking()
                .Include(t => t.TimePeriod)
                .Where(t => t.Person.UserName == UserName)
                .OrderBy(t => t.TimePeriod.PeriodStartDate)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TimeSheet>> GetTimeSheet(int id)
        {
            var timeSheet = await _context.TimeSheets.AsNoTracking()
                .Include(t => t.TimePeriod)
                .Include(t => t.Entries)
                .FirstOrDefaultAsync(t => t.Person.UserName == UserName && t.Id == id);
            if (timeSheet == null)
                return NotFound();
            return Ok(timeSheet);
        }

        [HttpGet("MissingTimePeriods")]
        public async Task<ActionResult<IEnumerable<TimePeriod>>> GetMissingTimePeriods()
        {
            return await _context.TimePeriod.AsNoTracking()
                .Where(p => p.TimeSheets.All(t => t.Person.UserName != UserName))
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<TimeSheet>> Create(TimeSheetCreate create)
        {
            var user = UserName;
            var timePeriod = await _context.TimePeriod.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == create.TimePeriodId);

            if (timePeriod == null)
                return BadRequest("Time Period specified was not found");
            
            var person = await _context.Persons.FirstOrDefaultAsync(p => p.UserName == user);
            if (person == null)
            {
                person = new Person { UserName = user };
                await _context.Persons.AddAsync(person);
                await _context.SaveChangesAsync();
            }

            var timeSheet = await _context.TimeSheets
                .AsNoTracking()
                .Include(t => t.TimePeriod)
                .Include(t => t.Entries)
                .FirstOrDefaultAsync(t => t.Person.UserName == user && t.TimePeriod == timePeriod);

            if (timeSheet == null)
            {
                timeSheet = new TimeSheet
                {
                    Person = person,
                    TimePeriod = timePeriod
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
                if(string.IsNullOrEmpty(name))
                    throw new ApplicationException("No user defined");
                return name;
            }
        }
    }
}