using System.Linq;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Atom.TimeTracker.Database
{
    public class TimeSheetContext : DbContext
    {
        private static readonly string SqlGetPersonsTimeSheet = @"
            SELECT persons.*, TimeSheets.id as TimeSheetId, TimeSheets.SubmittedDateTime as SubmittedDateTime
            FROM TimePeriods, Persons 
            FULL OUTER JOIN TimeSheets ON TimeSheets.timePeriodId = @timePeriodId AND Persons.Id = TimeSheets.PersonId
            WHERE persons.id IS NOT NULL AND TimePeriods.Id = @timePeriodId AND (TimeSheets.Id IS NOT NULL OR (Persons.IsActive = 1 and Persons.startDate <= TimePeriods.PeriodEndDate))
            ORDER By Name";

        public TimeSheetContext()
        {
        }

        public TimeSheetContext(DbContextOptions<TimeSheetContext> options)
            : base(options)
        {
        }

        public DbSet<TimePeriod> TimePeriods { get; set; }
        public DbSet<TimeSheet> TimeSheets { get; set; }
        public DbSet<TimeSheetEntry> TimeSheetEntries { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<TimePeriodSummary> TimePeriodSummary { get; set; }

        public IQueryable<PersonsTimeSheets> GetPersonsTimeSheets(int timePeriodId)
        {
            return this.Set<PersonsTimeSheets>().FromSqlRaw(SqlGetPersonsTimeSheet, new SqlParameter("@timePeriodId", timePeriodId)).AsNoTracking();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PersonsTimeSheets>().HasNoKey().ToView(null);

            modelBuilder.Entity<TimePeriodSummary>().HasNoKey().ToView("vw_TimePeriodSummary");

            modelBuilder.Entity<TimeSheet>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.HasOne(d => d.Person)
                    .WithMany(d => d.TimeSheets)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();
                entity.HasOne(d => d.TimePeriod)
                    .WithMany(d => d.TimeSheets)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();
            });

            modelBuilder.Entity<TimePeriod>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.PeriodEndDate).HasColumnType("DATE").IsRequired();
                entity.Property(d => d.PeriodStartDate).HasColumnType("DATE").IsRequired();
            });

            modelBuilder.Entity<TimeSheetEntry>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.HasOne(d => d.TimeSheet)
                    .WithMany(d => d.Entries)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                entity.HasOne(d => d.Project)
                    .WithMany()
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired();

                entity.Property(d => d.PercentOfPeriod).IsRequired();
                entity.Property(d => d.Value).IsRequired();
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).HasMaxLength(150).IsRequired();
                entity.HasIndex(d => d.Name).IsUnique();
            });

            modelBuilder.Entity<Person>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).HasMaxLength(100).IsRequired(false);
                entity.Property(d => d.UserName).HasMaxLength(150).IsRequired();
                entity.Property(d => d.StartDate).HasColumnType("DATE").HasDefaultValueSql("GetUtcDate()");
                entity.HasIndex(d => d.UserName).IsUnique();
            });
            
        }
    }
}
