using System.ComponentModel.DataAnnotations;

namespace PhysioHealthCare.Application.DTOs.Appointments
{
    public class UpdateAppointmentDto
    {
        [Required]
        public DateTime AppointmentDate { get; set; }

        [Required]
        [MaxLength(250)]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Notes { get; set; }

        public bool IsCompleted { get; set; }
    }
}
