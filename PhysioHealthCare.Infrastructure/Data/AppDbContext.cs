namespace PhysioHealthCare.Infrastructure.Data
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Domain.Entities;

    public class AppDbContext : DbContext
    {
        public AppDbContext(
            DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Patient> Patients => Set<Patient>();

        public DbSet<Appointment> Appointments => Set<Appointment>();

        public DbSet<User> Users => Set<User>();

        public DbSet<ClinicalRecord> ClinicalRecords =>
            Set<ClinicalRecord>();

        public DbSet<ClinicalHistory> ClinicalHistories =>
            Set<ClinicalHistory>();

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            modelBuilder.HasSequence<long>(
                "ClinicalRecordNumberSequence")
                .StartsAt(1)
                .IncrementsBy(1);

            modelBuilder.ApplyConfigurationsFromAssembly(
                typeof(AppDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }
    }
}