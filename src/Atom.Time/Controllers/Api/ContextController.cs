using System;
using System.Linq;
using System.Threading.Tasks;
using Atom.Time.Database;
using Atom.Time.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Atom.Time.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContextController : ControllerBase
    {
        private readonly TimeSheetContext _context;

        public ContextController(TimeSheetContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async ValueTask<ActionResult<ContextResponse>> Get()
        {
            var userName = this.GetUserName();
            var user = await _context.Persons.FirstOrDefaultAsync(p => p.UserName == userName);

            var isTimeSheetUser = User.IsInRole(AppRoles.TimeSheet);

            // ReSharper disable once InvertIf, makes the code much harder to work with.
            if (user == null && isTimeSheetUser)
            {
                user = new Person
                    {UserName = userName, Name = this.User.FindFirst("name")?.Value, StartDate = DateTime.Now.Date, IsActive = true};
                await _context.Persons.AddAsync(user);
                await _context.SaveChangesAsync();
            }

            return Ok(new ContextResponse
	        {
		        Name = this.User.FindFirst("name")?.Value,
		        User = userName,
                IsActive = user?.IsActive ?? false,
                StartDate = user?.IsActive == true ? user?.StartDate : (DateTime?)null,
		        IsTimeSheetUser = isTimeSheetUser, 
		        IsAdmin = User.IsInRole(AppRoles.Administrator)
	        });
        }

#if DEBUG
        [HttpGet("full")]
        public ActionResult GetFull()
        {
            return Ok(new
            {
                this.User.Identity.Name,
                this.User.Identity.IsAuthenticated,

                Identities = this.User.Identities.Select(i => new
                { i.IsAuthenticated, i.Name, i.AuthenticationType, i.Label, i.NameClaimType, i.RoleClaimType }),
                Claims = this.User.Claims.Select(i => new
                {
                    i.Value,
                    i.Properties,
                    i.Type,
                    i.ValueType
                })
            });
        }
#endif

        public class ContextResponse
        {
            public string Name { get; set; }
            public string User { get; set; }
            public bool IsTimeSheetUser { get; set; }
            public bool IsAdmin { get; set; }
            
            /// <summary>
            /// Indicates if the user is active and is required to complete time sheets.
            /// </summary>
            public bool IsActive { get; set; }

            /// <summary>
            /// The start date the user is required to fill out time sheets for, if they are active.
            /// </summary>
            public DateTime? StartDate { get; set; }
        }
    }
}