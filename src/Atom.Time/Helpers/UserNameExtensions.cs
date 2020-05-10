using System;
using Microsoft.AspNetCore.Mvc;

namespace Atom.Time.Helpers
{
    public static class UserNameExtensions
    {
        public static string GetUserName(this ControllerBase controller)
        {
                var name = controller?.User?.Identity?.Name ?? "TestUser"; // TODO: Remove once Auth is added.
                if (string.IsNullOrEmpty(name))
                    throw new ApplicationException("No user defined");
                return name;
        }
    }
}
