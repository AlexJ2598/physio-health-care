using System.ComponentModel.DataAnnotations;

namespace PhysioHealthCare.Application.DTOs.Appointments
{
    public class UpdateAppointmentDto
    {
        public DateTime AppointmentDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsCompleted { get; set; }
    }
}
