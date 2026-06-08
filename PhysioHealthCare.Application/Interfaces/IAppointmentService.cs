using PhysioHealthCare.Application.DTOs.Appointments;

namespace PhysioHealthCare.Application.Interfaces
{
    public interface IAppointmentService
    {
        Task<IReadOnlyList<AppointmentResponseDto>> GetAllAsync();

        Task<AppointmentResponseDto?> GetByIdAsync(Guid id);

        Task<AppointmentResponseDto?> CreateAsync(CreateAppointmentDto dto);

        Task<AppointmentResponseDto?> UpdateAsync(Guid id, UpdateAppointmentDto dto);

        Task<bool> SoftDeleteAsync(Guid id);
    }
}
