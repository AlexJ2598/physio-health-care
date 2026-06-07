namespace PhysioHealthCare.Domain.Entities
{
    using PhysioHealthCare.Domain.Common;
    public class Appointment : BaseEntity
    {
        public Guid PatientId { get; set; }

        public DateTime AppointmentDate { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public bool IsCompleted { get; set; }

        public Patient Patient { get; set; } = null!;
    }
}
