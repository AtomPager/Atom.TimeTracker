using Atoms.Time.Helpers;
using NUnit.Framework;

namespace Atoms.Time.Tests
{
    public class ColorSelectorTests
    {
        [TestCase(0, "hsl(0, 100%, 50%)")]
        [TestCase(1, "hsl(30, 100%, 50%)")]
        [TestCase(2, "hsl(60, 100%, 50%)")]
        [TestCase(3, "hsl(90, 100%, 50%)")]
        [TestCase(4, "hsl(120, 100%, 50%)")]
        [TestCase(5, "hsl(150, 100%, 50%)")]
        [TestCase(6, "hsl(180, 100%, 50%)")]
        [TestCase(7, "hsl(210, 100%, 50%)")]
        [TestCase(8, "hsl(240, 100%, 50%)")]
        [TestCase(9, "hsl(270, 100%, 50%)")]
        [TestCase(10, "hsl(300, 100%, 50%)")]
        [TestCase(11, "hsl(330, 100%, 50%)")]
        [TestCase(12, "hsl(0, 100%, 40%)")]
        [TestCase(18, "hsl(180, 100%, 40%)")]
        [TestCase(23, "hsl(330, 100%, 40%)")]
        [TestCase(24, "hsl(0, 100%, 60%)")]
        [TestCase(29, "hsl(150, 100%, 60%)")]
        [TestCase(35, "hsl(330, 100%, 60%)")]
        [TestCase(36, "hsl(0, 100%, 30%)")]
        [TestCase(47, "hsl(330, 100%, 30%)")]
        [TestCase(48, "hsl(0, 100%, 70%)")]
        [TestCase(59, "hsl(330, 100%, 70%)")]
        [TestCase(60, "hsl(0, 100%, 20%)")]
        [TestCase(71, "hsl(330, 100%, 20%)")]
        [TestCase(72, "hsl(0, 100%, 80%)")]
        [TestCase(84, "hsl(0, 90%, 50%)")]
        [TestCase(1043, "hsl(330, 0%, 80%)")]
        [TestCase(1044, "hsl(0, 100%, 50%)")]
        [TestCase(1045, "hsl(30, 100%, 50%)")]
        public void RunTest(int input, string expect)
        {
            Assert.AreEqual(expect, ColorSelector.GetHslColor(input));
        }
    }
}
