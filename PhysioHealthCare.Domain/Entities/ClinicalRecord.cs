namespace PhysioHealthCare.Domain.Entities
{
    using PhysioHealthCare.Domain.Common;

    public class ClinicalRecord : BaseEntity
    {
        public Guid PatientId { get; set; }

        public string RecordNumber { get; set; } = string.Empty;

        public Patient Patient { get; set; } = null!;

        public ClinicalHistory? ClinicalHistory { get; set; }
    }
}