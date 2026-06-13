using System.ComponentModel.DataAnnotations;

namespace PhysioHealthCare.Application.DTOs.Appointments
{
    public class CreateAppointmentDto
    {

        public Guid PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
