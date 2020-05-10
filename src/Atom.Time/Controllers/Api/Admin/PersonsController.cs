using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Atom.Time.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atom.Time.Controllers.Api.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(AuthPolicy.Administrator)]
    public class PersonsController : ControllerBase
    {
        private readonly TimeSheetContext _context;

        public PersonsController(TimeSheetContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async ValueTask<ActionResult<List<Person>>> Get()
        {
            return await _context.Persons.ToListAsync();
        }

        [HttpGet("{id}")]
        public async ValueTask<Person> GetPerson(int id)
        {
            return await _context.Persons.FirstOrDefaultAsync(p => p.Id == id);
        }

        [HttpPost("{id}")]
        public async ValueTask<ActionResult<Person>> UpdatePerson(int id, PersonCreate person)
        {
            var p = await _context.Persons.FirstOrDefaultAsync(p => p.Id == id);
            if (p == null)
                return NotFound();

            var hasChange = false;

            if (!string.IsNullOrWhiteSpace(person.Name) && !person.Name.Equals(p.Name, StringComparison.InvariantCulture))
            {
                p.Name = person.Name;
                hasChange = true;
            }

            if (person.IsActive.HasValue && p.IsActive != person.IsActive.Value)
            {
                p.IsActive = person.IsActive.Value;
                hasChange = true;
            }

            if (person.StartDate.HasValue && p.StartDate != person.StartDate.Value)
            {
                p.StartDate = person.StartDate.Value;
                hasChange = true;
            }

            if (hasChange)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(p);
        }

        [HttpPost]
        public async ValueTask<ActionResult<Person>> Create([FromBody] PersonCreate person)
        {
            if (string.IsNullOrWhiteSpace(person.UserName))
                return BadRequest("User name is required");

            if (string.IsNullOrWhiteSpace(person.Name))
                person.Name = person.UserName;

            var newPerson = new Person
            {
                IsActive = person.IsActive ?? true,
                UserName = person.UserName, 
                Name = person.Name, 
                StartDate = person.StartDate ?? DateTime.Now.Date
            };
            await _context.Persons.AddAsync(newPerson);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPerson", new {newPerson.Id}, newPerson);
        }

        public class PersonCreate
        {
            public string UserName { get; set; }
            public string Name { get; set; }
            public DateTime? StartDate { get; set; }
            public bool? IsActive { get; set; }
        }
    }
}