﻿// <auto-generated />
using System;
using Atom.Time.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Atom.Time.Migrations
{
    [DbContext(typeof(TimeSheetContext))]
    [Migration("20200510080208_RemoveIsAdminFromPerson")]
    partial class RemoveIsAdminFromPerson
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Atom.Time.Database.Person", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(100)")
                        .HasMaxLength(100);

                    b.Property<DateTime>("StartDate")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("DATE")
                        .HasDefaultValueSql("GetUtcDate()");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("nvarchar(150)")
                        .HasMaxLength(150);

                    b.HasKey("Id");

                    b.HasIndex("UserName")
                        .IsUnique();

                    b.ToTable("Persons");
                });

            modelBuilder.Entity("Atom.Time.Database.Project", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Classification")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Group")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsArchived")
                        .HasColumnType("bit");

                    b.Property<bool>("IsRnD")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(150)")
                        .HasMaxLength(150);

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("Atom.Time.Database.TimePeriod", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("PeriodEndDate")
                        .HasColumnType("DATE");

                    b.Property<DateTime>("PeriodStartDate")
                        .HasColumnType("DATE");

                    b.Property<int>("WorkDays")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("TimePeriods");
                });

            modelBuilder.Entity("Atom.Time.Database.TimeSheet", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("PersonId")
                        .HasColumnType("int");

                    b.Property<DateTimeOffset?>("SubmittedDateTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<int>("TimePeriodId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("PersonId");

                    b.HasIndex("TimePeriodId", "PersonId")
                        .IsUnique();

                    b.ToTable("TimeSheets");
                });

            modelBuilder.Entity("Atom.Time.Database.TimeSheetEntry", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Note")
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("PercentOfPeriod")
                        .HasColumnType("float");

                    b.Property<int?>("ProjectId")
                        .HasColumnType("int");

                    b.Property<int>("TimeSheetId")
                        .HasColumnType("int");

                    b.Property<double>("Value")
                        .HasColumnType("float");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.HasIndex("TimeSheetId");

                    b.ToTable("TimeSheetEntries");
                });

            modelBuilder.Entity("Atom.Time.Database.TimeSheet", b =>
                {
                    b.HasOne("Atom.Time.Database.Person", "Person")
                        .WithMany("TimeSheets")
                        .HasForeignKey("PersonId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("Atom.Time.Database.TimePeriod", "TimePeriod")
                        .WithMany("TimeSheets")
                        .HasForeignKey("TimePeriodId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();
                });

            modelBuilder.Entity("Atom.Time.Database.TimeSheetEntry", b =>
                {
                    b.HasOne("Atom.Time.Database.Project", "Project")
                        .WithMany("TimeSheetEntries")
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Atom.Time.Database.TimeSheet", "TimeSheet")
                        .WithMany("Entries")
                        .HasForeignKey("TimeSheetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
