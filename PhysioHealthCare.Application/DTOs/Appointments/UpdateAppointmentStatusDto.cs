namespace PhysioHealthCare.Application.DTOs.Appointments
{
    using PhysioHealthCare.Domain.Enums;

    public class UpdateAppointmentStatusDto
    {
        public AppointmentStatus Status { get; set; }
    }
}