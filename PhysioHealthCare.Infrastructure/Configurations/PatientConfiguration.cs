namespace PhysioHealthCare.Infrastructure.Configurations
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using PhysioHealthCare.Domain.Entities;
    public class PatientConfiguration : IEntityTypeConfiguration<Patient>
    {
        public void Configure(EntityTypeBuilder<Patient> entity)
        {
            entity.ToTable("Patients");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.FirstName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.LastName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.PhoneNumber)
                .HasMaxLength(20);

            entity.Property(x => x.Email)
                .HasMaxLength(150);

            entity.Property(x => x.Address)
                .HasMaxLength(250);

            entity.Property(x => x.Notes)
                .HasMaxLength(500);

            entity.Property(x => x.CreatedAt)
                .IsRequired();

            entity.Property(x => x.IsActive)
                .HasDefaultValue(true);
        }
    }
}
