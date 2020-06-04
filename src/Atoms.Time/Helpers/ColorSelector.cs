using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Math = System.Math;

namespace Atoms.Time.Helpers
{
    public static class ColorSelector
    {
        public static string GetHslColor(int count)
        {
            count = count % 1044; // the code below only gives us 1045 colors.
            var h = (count % 12) * 30;
            var round = count / 12;
            var r = Math.DivRem(round + 1, 2, out var d);

            var l = 50 + ((r % 4) * 10 * (d == 0 ? -1 : 1));
            var s = 100 - ((r / 4) * 10);
            
            return $"hsl({h}, {s}%, {l}%)";
        }
    }
}
