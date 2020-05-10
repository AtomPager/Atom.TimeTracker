using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Atom.Time.Database;
using Atom.Time.Database.Views;
using Atom.Time.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atom.Time.Controllers.Api
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
                .Where(p => p.UserName == this.GetUserName());

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
                .ThenInclude(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == id); 
            // TODO: Add permission so only the person and their managers can see the time sheet.

            if (timeSheet == null)
                return NotFound();

            return Ok(timeSheet);
        }

        [HttpPost("{id}")]
        public async Task<ActionResult<TimeSheet>> UpdateTimeSheet(int id, [FromBody] TimeSheetUpdate timeSheetUpdate)
        {
            if (timeSheetUpdate?.Entries == null)
                return new BadRequestResult();

            var timeSheet = await _context.TimeSheets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Person.UserName == this.GetUserName() && t.Id == id);

            if (timeSheet == null)
                return NotFound();

            if (timeSheet.SubmittedDateTime.HasValue)
                return BadRequest("Time Sheet has already been submitted.");

            var timeSheetEntries = await _context.TimeSheetEntries
                .Where(t => t.TimeSheet.Person.UserName == this.GetUserName() && t.TimeSheetId == id)
                .ToDictionaryAsync(s => s.Id);

            foreach (var update in timeSheetUpdate.Entries)
            {
                if (update.Value < 0)
                    return BadRequest($"Value for entries must be positive.");

                if (timeSheetEntries.TryGetValue(update.Id, out var e))
                {
                    e.Value = update.Value;
                    e.Note = update.Note;
                    e.ProjectId = update.Project?.Id;
                }
                else
                {
                    // Id was not found or not for this time sheet
                    return NotFound(update);
                }
            }

            var totalValues = timeSheetEntries.Values.Sum(e => e.Value);
            foreach (var e in timeSheetEntries.Values)
            {
                e.PercentOfPeriod = totalValues < .001 ? 0 : (e.Value / totalValues);
            }

            await _context.SaveChangesAsync();
            timeSheet = await _context.TimeSheets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Person.UserName == this.GetUserName() && t.Id == id);

            return timeSheet;
        }

        [HttpPost("{id}/submit")]
        public async Task<ActionResult<TimeSheet>> SubmitTimeSheet(int id)
        {
            var timeSheet = await _context.TimeSheets
                .FirstOrDefaultAsync(t => t.Person.UserName == this.GetUserName() && t.Id == id);

            if (timeSheet == null)
                return NotFound();

            if (timeSheet.SubmittedDateTime.HasValue)
                return BadRequest("Time Sheet has already been submitted.");

            timeSheet.SubmittedDateTime = DateTimeOffset.Now;
            await _context.SaveChangesAsync();

            return Ok(timeSheet);
        }

        [HttpPost("{id}/reject")]
        public async Task<ActionResult<TimeSheet>> RejectTimeSheet(int id)
        {
            // TODO: Check that the user has the rights to do this on this sheet.

            var timeSheet = await _context.TimeSheets
                .FirstOrDefaultAsync(t => t.Id == id);

            if (timeSheet == null)
                return NotFound();

            if (!timeSheet.SubmittedDateTime.HasValue)
                return new NoContentResult();

            timeSheet.SubmittedDateTime = null;
            await _context.SaveChangesAsync();

            return new NoContentResult();
        }

        [HttpPost("{id}/entries")]
        public async Task<ActionResult<TimeSheetEntry>> CreateTimeSheetEntry(int id)
        {
            var timeSheet = await _context.TimeSheets
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Person.UserName == this.GetUserName() && t.Id == id);

            if (timeSheet == null)
                return NotFound();

            if (timeSheet.SubmittedDateTime.HasValue)
                return BadRequest("Time Sheet has already been submitted.");

            var entry = new TimeSheetEntry { TimeSheetId = id };
            await _context.TimeSheetEntries.AddAsync(entry);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTimeSheet", new { id = timeSheet.Id }, entry);
        }

        [HttpDelete("{id}/entries/{entryId}")]
        public async Task<ActionResult> DeleteTimeSheetEntry(int id, int entryId)
        {
            var timeSheetEntry = await _context.TimeSheetEntries
                .FirstOrDefaultAsync(t =>
                    t.TimeSheet.Person.UserName == this.GetUserName()
                    && t.TimeSheet.SubmittedDateTime == null
                    && t.TimeSheet.Id == id
                    && t.Id == entryId);

            if (timeSheetEntry == null)
                return NotFound();

            _context.TimeSheetEntries.Remove(timeSheetEntry);
            await _context.SaveChangesAsync();

            return new NoContentResult();
        }

        [HttpPost]
        public async Task<ActionResult<TimeSheet>> Create(TimeSheetCreate create)
        {
            var user = this.GetUserName();
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

        public class TimeSheetUpdate
        {
            public List<TimeSheetEntryUpdate> Entries { get; set; }
        }

        public class TimeSheetEntryUpdate
        {
            public int Id { get; set; }
            public TimeSheetEntryProject Project { get; set; }

            public string Note { get; set; }

            /// <summary>
            /// This value given my the person representing the part count they spend on this project during the period
            /// </summary>
            public double Value { get; set; }

            public class TimeSheetEntryProject
            {
                public int Id { get; set; }
            }
        }
    }

}