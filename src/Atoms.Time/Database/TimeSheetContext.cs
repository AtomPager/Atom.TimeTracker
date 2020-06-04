using Atoms.Time.Database.Views;
using Microsoft.EntityFrameworkCore;

namespace Atoms.Time.Database
{
    public class TimeSheetContext : DbContext
    {
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
        public DbSet<PersonTimeSheets> PersonTimeSheets { get; set; }
        public DbSet<TimePeriodReport> TimePeriodReport { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<PersonsTimeSheets>().HasNoKey().ToView(null);
            modelBuilder.Entity<PersonTimeSheets>().HasNoKey().ToView("vw_PersonTimeSheets");

            modelBuilder.Entity<TimePeriodSummary>().HasNoKey().ToView("vw_TimePeriodSummary");
            modelBuilder.Entity<TimePeriodReport>().HasNoKey().ToView("vw_TimePeriodReport");

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

                entity.HasIndex(t => new {t.TimePeriodId, t.PersonId}).IsUnique();
            });

            modelBuilder.Entity<TimePeriod>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.PeriodEndDate).HasColumnType("DATE").IsRequired();
                entity.Property(d => d.PeriodStartDate).HasColumnType("DATE").IsRequired();
                entity.HasIndex(d => new {d.PeriodEndDate, d.PeriodStartDate}).IsUnique();
            });

            modelBuilder.Entity<TimeSheetEntry>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.HasOne(d => d.TimeSheet)
                    .WithMany(d => d.Entries)
                    .OnDelete(DeleteBehavior.Cascade)
                    .IsRequired();

                entity.HasOne(d => d.Project)
                    .WithMany(d=>d.TimeSheetEntries)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity.Property(d => d.PercentOfPeriod).IsRequired();
                entity.Property(d => d.Value).IsRequired();
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).HasMaxLength(150).IsRequired();
                entity.HasIndex(d => d.Name).IsUnique();
                entity.Property(d => d.ShowByDefault).HasDefaultValue(false);

                entity.Property(d => d.Classification).HasMaxLength(150);
                entity.Property(d => d.Group).HasMaxLength(150);
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
