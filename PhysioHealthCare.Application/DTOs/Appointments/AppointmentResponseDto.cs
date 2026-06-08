namespace PhysioHealthCare.Application.DTOs.Appointments
{
    public class AppointmentResponseDto
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }

        public string PatientName { get; set; } = string.Empty;

        public DateTime AppointmentDate { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public bool IsCompleted { get; set; }
    }
}
