using Microsoft.EntityFrameworkCore;

namespace Atom.TimeTracker.Database
{
    public class TimeSheetContext: DbContext
        {
        public TimeSheetContext()
        {
        }

        public TimeSheetContext(DbContextOptions<TimeSheetContext> options)
            : base(options)
        {
        }

        public DbSet<TimePeriod> TimePeriod { get; set; }
        public DbSet<TimeSheet> TimeSheets { get; set; }
        public DbSet<TimeSheetEntry> TimeSheetEntries { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Project> Projects { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TimeSheet>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.HasOne(d => d.Person)
                    .WithMany(d=>d.TimeSheets)
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
                entity.Property(d => d.PeriodEndDate).IsRequired();
                entity.Property(d => d.PeriodStartDate).IsRequired();
            });

            modelBuilder.Entity<TimeSheetEntry>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.HasOne(d => d.TimeSheet)
                    .WithMany(d=>d.Entries)
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
                entity.Property(d=>d.Name).HasMaxLength(100).IsRequired(false);
                entity.Property(d=>d.UserName).HasMaxLength(150).IsRequired();
                entity.Property(d => d.StartDate).HasDefaultValueSql("GetUtcDate()");
                entity.HasIndex(d => d.UserName).IsUnique();
            });
        }
    }
}
