using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Atom.TimeTracker.Database;
using Atom.TimeTracker.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            return new ContextResponse {Name = this.User.Identity.Name, User = this.GetUserName()};
        }

        public class ContextResponse
        {
            public string Name { get; set; }
            public string User { get; set; }
        }
    }
}
