namespace PhysioHealthCare.Infrastructure.Configurations
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using PhysioHealthCare.Domain.Entities;

    public class ClinicalHistoryConfiguration : IEntityTypeConfiguration<ClinicalHistory>
    {
        public void Configure(EntityTypeBuilder<ClinicalHistory> builder)
        {
            builder.ToTable("ClinicalHistories");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ClinicalRecordId)
                .IsRequired();

            builder.HasIndex(x => x.ClinicalRecordId)
                .IsUnique();

            // Reason for consultation and current condition

            builder.Property(x => x.ChiefComplaint)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(x => x.CurrentCondition)
                .HasMaxLength(2000);

            builder.Property(x => x.ConditionOnsetDate)
                .IsRequired(false);

            builder.Property(x => x.InjuryMechanism)
                .HasMaxLength(1000);

            // Medical history and previous surgeries

            builder.Property(x => x.RelevantMedicalHistory)
                .HasMaxLength(2000);

            builder.Property(x => x.PreviousSurgeries)
                .HasMaxLength(2000);

            builder.Property(x => x.PreviousInjuries)
                .HasMaxLength(2000);

            builder.Property(x => x.Allergies)
                .HasMaxLength(1000);

            builder.Property(x => x.CurrentMedications)
                .HasMaxLength(1000);

            // Medical information and referring physician

            builder.Property(x => x.MedicalDiagnosis)
                .HasMaxLength(2000);

            builder.Property(x => x.ReferringPhysician)
                .HasMaxLength(200);

            builder.Property(x => x.PreviousStudies)
                .HasMaxLength(2000);

            // Pain level and functional limitations

            builder.Property(x => x.PainLevel)
                .IsRequired(false);

            builder.ToTable(
                "ClinicalHistories",
                tableBuilder =>
                {
                    tableBuilder.HasCheckConstraint(
                        "CK_ClinicalHistories_PainLevel",
                        "[PainLevel] IS NULL OR ([PainLevel] >= 0 AND [PainLevel] <= 10)");
                });

            builder.Property(x => x.FunctionalLimitations)
                .HasMaxLength(2000);

            builder.Property(x => x.PhysicalTherapyAssessment)
                .HasMaxLength(4000);

            builder.Property(x => x.PhysicalTherapyDiagnosis)
                .HasMaxLength(2000);

            // Notes

            builder.Property(x => x.Notes)
                .HasMaxLength(4000);

            // Base entity

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .IsRequired(false);

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Configure the relationship with ClinicalRecord

            builder.HasOne(x => x.ClinicalRecord)
                .WithOne(x => x.ClinicalHistory)
                .HasForeignKey<ClinicalHistory>(x => x.ClinicalRecordId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}