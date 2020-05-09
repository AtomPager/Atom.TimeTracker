using System.Linq;
using Atom.TimeTracker.Database;
using Atom.TimeTracker.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace Atom.TimeTracker.Controllers.Api
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
        public ContextResponse Get()
        {
	        return new ContextResponse
	        {
		        Name = this.User.FindFirst("name")?.Value,
		        User = this.GetUserName(),
		        IsTimeSheetUser = User.IsInRole(AppRoles.TimeSheet), 
		        IsAdmin = User.IsInRole(AppRoles.Administrator)
	        };
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
        }
    }
}