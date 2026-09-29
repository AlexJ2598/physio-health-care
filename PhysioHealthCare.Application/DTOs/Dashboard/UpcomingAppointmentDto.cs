namespace PhysioHealthCare.Application.DTOs.Dashboard
{
    using PhysioHealthCare.Domain.Enums;
    public class UpcomingAppointmentDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public AppointmentStatus Status { get; set; }
    }
}
