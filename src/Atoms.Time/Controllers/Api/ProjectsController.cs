using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Atoms.Time.Database;
using Atoms.Time.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atoms.Time.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthPolicy.TimeSheet)]
    public class ProjectsController : ControllerBase
    {
        private readonly TimeSheetContext _context;

        public ProjectsController(TimeSheetContext context)
        {
            _context = context;
        }

        [HttpGet()]
        public async Task<IEnumerable<Project>> GetProjects(string searchTerm = null, bool showAll = false)
        {
            IQueryable<Project> q = _context.Projects;
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                q = q.Where(p => (p.Name.Contains(searchTerm) ||  p.KeyWords.Contains(searchTerm)) && p.IsArchived == false);
            }
            else if (!showAll)
            {
                q = q.Where(p => p.IsArchived == false
                                 && (p.ShowByDefault
                                     || p.TimeSheetEntries.Any(s =>
                                         s.TimeSheet.Person.UserName == this.GetUserName()
                                         && s.TimeSheet.TimePeriod.PeriodEndDate > DateTime.Now.AddMonths(-1))));
            }

            return await q.OrderBy(p => p.Name).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();
            return project;
        }

        [HttpPost]
        public async Task<ActionResult<Project>> PostCreateProject([FromBody]ProjectContent content)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Name == content.Name);
            if (project != null)
            {
                if (project.IsArchived)
                {
                    project.IsArchived = false;
                    await _context.SaveChangesAsync();
                    return CreatedAtAction("GetProject", new { id = project.Id }, project);
                }
                return Conflict("Project with this name already exists.");
            }

            project = new Project
            {
                Name = content.Name,
                IsRnD = content.IsRnD ?? false,
                IsArchived = content.IsArchived ?? false,
                Classification = content.Classification,
                Group = content.Group,
                KeyWords = content.KeyWords,
                ShowByDefault = this.User.IsInRole(AppRoles.Administrator) && content.ShowByDefault.HasValue && content.ShowByDefault.Value
            };

            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProject", new { id = project.Id }, project);
        }



        [HttpPost("{id}/mergeInto/{targetId}")]
        [Authorize(AuthPolicy.Administrator)]
        public async Task<IActionResult> PostMergeProject(int id, int targetId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
            if (project == null)
                return NotFound();
            var targetProject = await _context.Projects.FirstOrDefaultAsync(p => p.Id == targetId);
            if (targetProject == null)
                return NotFound();

            await _context.Database.ExecuteSqlInterpolatedAsync($"UPDATE [TimeSheetEntries] SET ProjectId = {targetId} where ProjectId = {id}");

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("{id}")]
        [Authorize(AuthPolicy.Administrator)]
        public async Task<IActionResult> PostUpdateProject(int id, [FromBody]ProjectContent content)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
            if (project == null)
                return NotFound();

            var hasChange = false;
            content.Name = content.Name?.Trim();

            if (!string.IsNullOrWhiteSpace(content.Name)
                && !content.Name.Equals(project.Name, StringComparison.InvariantCulture))
            {
                if (await _context.Projects.AnyAsync(p => p.Name == content.Name && p.Id != id))
                    return Conflict("Project with this name already exists.");

                project.Name = content.Name;
                hasChange = true;
            }

            if (!string.IsNullOrWhiteSpace(content.KeyWords)
                && !content.KeyWords.Equals(project.KeyWords, StringComparison.InvariantCulture))
            {
	            project.KeyWords = content.KeyWords;
	            hasChange = true;
            }

            if (content.IsRnD.HasValue)
            {
                project.IsRnD = content.IsRnD.Value;
                hasChange = true;
            }

            if (content.IsArchived.HasValue)
            {
                project.IsArchived = content.IsArchived.Value;
                hasChange = true;
            }

            if (content.Classification != null)
            {
                project.Classification = content.Classification;
                hasChange = true;
            }

            if (content.Group != null)
            {
                project.Group = content.Group;
                hasChange = true;
            }

            if (content.ShowByDefault.HasValue)
            {
                project.ShowByDefault = content.ShowByDefault.Value;
                hasChange = true;
            }

            if (hasChange)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(project);
        }

        public class ProjectContent
        {
            public string Name { get; set; }
            public bool? IsRnD { get; set; }
            public bool? IsArchived { get; set; }
            public string Group { get; set; }
            public string Classification { get; set; }
            public bool? ShowByDefault { get; set; }
            public string KeyWords { get; set; }
        }
    }
}