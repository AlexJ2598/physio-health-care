namespace PhysioHealthCare.Application.DTOs.ClinicalRecords
{
    public class ClinicalRecordResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string RecordNumber { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool HasClinicalHistory { get; set; }
    }
}
