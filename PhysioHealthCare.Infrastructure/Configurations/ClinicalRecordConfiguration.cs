namespace PhysioHealthCare.Infrastructure.Configurations
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using PhysioHealthCare.Domain.Entities;

    public class ClinicalRecordConfiguration : IEntityTypeConfiguration<ClinicalRecord>
    {
        public void Configure(EntityTypeBuilder<ClinicalRecord> builder)
        {
            builder.ToTable("ClinicalRecords");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.RecordNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(x => x.RecordNumber)
                .IsUnique();

            builder.Property(x => x.PatientId)
                .IsRequired();

            builder.HasIndex(x => x.PatientId)
                .IsUnique();

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .IsRequired(false);

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasOne(x => x.Patient)
                .WithOne(x => x.ClinicalRecord)
                .HasForeignKey<ClinicalRecord>(x => x.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}