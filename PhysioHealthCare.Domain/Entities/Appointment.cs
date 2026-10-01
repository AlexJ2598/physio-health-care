namespace PhysioHealthCare.Domain.Entities
{
    using PhysioHealthCare.Domain.Common;
    using PhysioHealthCare.Domain.Enums;

    public class Appointment : BaseEntity
    {
        public Guid PatientId { get; set; }

        public DateTime AppointmentDate { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public AppointmentStatus Status { get; set; }
            = AppointmentStatus.Scheduled;

        public DateTime? StartedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public DateTime? CancelledAt { get; set; }

        public bool WasAutomaticallyCancelled { get; set; }

        public Patient Patient { get; set; } = null!;
    }
}