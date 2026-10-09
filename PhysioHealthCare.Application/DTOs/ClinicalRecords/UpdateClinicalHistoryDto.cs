namespace PhysioHealthCare.Application.DTOs.ClinicalRecords
{
    public class UpdateClinicalHistoryDto
    {
        // Reason for consultation and current condition

        public string ChiefComplaint { get; set; } = string.Empty;

        public string? CurrentCondition { get; set; }

        public DateOnly? ConditionOnsetDate { get; set; }

        public string? InjuryMechanism { get; set; }

        // Medical history

        public string? RelevantMedicalHistory { get; set; }

        public string? PreviousSurgeries { get; set; }

        public string? PreviousInjuries { get; set; }

        public string? Allergies { get; set; }

        public string? CurrentMedications { get; set; }

        // Medical information

        public string? MedicalDiagnosis { get; set; }

        public string? ReferringPhysician { get; set; }

        public string? PreviousStudies { get; set; }

        // Initial physical therapy assessment

        public int? PainLevel { get; set; }

        public string? FunctionalLimitations { get; set; }

        public string? PhysicalTherapyAssessment { get; set; }

        public string? PhysicalTherapyDiagnosis { get; set; }

        // General observations

        public string? Notes { get; set; }
    }
}