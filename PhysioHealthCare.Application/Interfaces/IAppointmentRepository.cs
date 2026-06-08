namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Domain.Entities;
    public interface IAppointmentRepository
    {
        Task<IReadOnlyList<AppointmentResponseDto>> GetAllAsync();

        Task<AppointmentResponseDto?> GetByIdAsync(Guid id);

        Task<Appointment?> GetByIdForUpdateAsync(Guid id);

        Task<Appointment> CreateAsync(Appointment appointment);

        Task<Appointment> UpdateAsync(Appointment appointment);

        Task<bool> SoftDeleteAsync(Guid id);
    }
}
