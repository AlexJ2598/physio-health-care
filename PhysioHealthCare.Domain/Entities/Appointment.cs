namespace PhysioHealthCare.Domain.Entities
{
    using PhysioHealthCare.Domain.Common;
    using PhysioHealthCare.Domain.Enums;
    using System.Net.NetworkInformation;

    public class Appointment : BaseEntity
    {
        public Guid PatientId { get; set; }

        public DateTime AppointmentDate { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public AppointmentStatus Status { get; set; }
            = AppointmentStatus.Scheduled;

        public Patient Patient { get; set; } = null!;
    }
}
