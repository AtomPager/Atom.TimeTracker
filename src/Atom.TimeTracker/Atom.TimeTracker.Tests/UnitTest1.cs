using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Atom.TimeTracker.Controllers.Api;
using Atom.TimeTracker.Controllers.Api.Admin;
using Atom.TimeTracker.Database;
using NUnit.Framework;

namespace Atom.TimeTracker.Tests
{
    public class Tests
    {
        private readonly Func<TimePeriod, bool> _overlapPredicate =
            TimePeriodsController.OverlapPredicate(Date("2020-3-5"), Date("2020-3-10")).Compile();

        [TestCase("2020-03-05", "2020-03-10", true, TestName = "Exact Manage")]
        [TestCase("2020-03-04", "2020-03-11", true, TestName = "New contained with-in existing")]
        [TestCase("2020-03-06", "2020-03-09", true, TestName = "Existing contained with-in new")]
        // Overlaps end of existing
        [TestCase("2020-03-03", "2020-03-5", true)]
        [TestCase("2020-03-03", "2020-03-6", true)]
        [TestCase("2020-03-03", "2020-03-10", true)]
        // overlaps start of existing
        [TestCase("2020-03-05", "2020-03-12", true)]
        [TestCase("2020-03-09", "2020-03-12", true)]
        [TestCase("2020-03-10", "2020-03-12", true)]
        // good tests
        [TestCase("2020-03-03", "2020-03-04", false, TestName = "Existing ends before new")]
        [TestCase("2020-03-11", "2020-03-12", false, TestName = "Existing starts after new")]
        public void TestForOverLappingTimeSheet(string start, string end, bool expected)
        {
            Assert.AreEqual(expected, _overlapPredicate.Invoke(new TimePeriod { PeriodStartDate = Date(start), PeriodEndDate = Date(end)}));
        }

        private static DateTime Date(string date)
        {
            return DateTime.Parse(date + "Z");
        }

        private IQueryable<TimePeriod> GetTimeSheet(DateTime start, DateTime end)
        {
            return new EnumerableQuery<TimePeriod>(new List<TimePeriod> {new TimePeriod { PeriodStartDate = start, PeriodEndDate = end}});
        }
    }
}