namespace PhysioHealthCare.Application.Validators.ClinicalRecords
{
    using FluentValidation;
    using DTOs.ClinicalRecords;
    using Interfaces;

    public class CreateClinicalHistoryDtoValidator
        : AbstractValidator<CreateClinicalHistoryDto>
    {
        public CreateClinicalHistoryDtoValidator(
            IClinicClock clinicClock)
        {
            // Reason for consultation and current condition

            RuleFor(x => x.ChiefComplaint)
                .NotEmpty()
                .MaximumLength(1000);

            RuleFor(x => x.CurrentCondition)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.CurrentCondition));

            RuleFor(x => x.ConditionOnsetDate)
                .LessThanOrEqualTo(clinicClock.Today)
                .When(x => x.ConditionOnsetDate.HasValue)
                .WithMessage(
                    "Condition onset date cannot be in the future.");

            RuleFor(x => x.InjuryMechanism)
                .MaximumLength(1000)
                .When(x => !string.IsNullOrWhiteSpace(x.InjuryMechanism));

            // Medical history

            RuleFor(x => x.RelevantMedicalHistory)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.RelevantMedicalHistory));

            RuleFor(x => x.PreviousSurgeries)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.PreviousSurgeries));

            RuleFor(x => x.PreviousInjuries)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.PreviousInjuries));

            RuleFor(x => x.Allergies)
                .MaximumLength(1000)
                .When(x => !string.IsNullOrWhiteSpace(x.Allergies));

            RuleFor(x => x.CurrentMedications)
                .MaximumLength(1000)
                .When(x => !string.IsNullOrWhiteSpace(x.CurrentMedications));

            // Medical information

            RuleFor(x => x.MedicalDiagnosis)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.MedicalDiagnosis));

            RuleFor(x => x.ReferringPhysician)
                .MaximumLength(200)
                .When(x => !string.IsNullOrWhiteSpace(x.ReferringPhysician));

            RuleFor(x => x.PreviousStudies)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.PreviousStudies));

            // Initial physical therapy assessment

            RuleFor(x => x.PainLevel)
                .InclusiveBetween(0, 10)
                .When(x => x.PainLevel.HasValue);

            RuleFor(x => x.FunctionalLimitations)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.FunctionalLimitations));

            RuleFor(x => x.PhysicalTherapyAssessment)
                .MaximumLength(4000)
                .When(x => !string.IsNullOrWhiteSpace(x.PhysicalTherapyAssessment));

            RuleFor(x => x.PhysicalTherapyDiagnosis)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.PhysicalTherapyDiagnosis));

            // General observations

            RuleFor(x => x.Notes)
                .MaximumLength(4000)
                .When(x => !string.IsNullOrWhiteSpace(x.Notes));
        }
    }
}