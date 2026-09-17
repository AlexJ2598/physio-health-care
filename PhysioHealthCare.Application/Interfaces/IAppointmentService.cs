namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.DTOs.Common;
    public interface IAppointmentService
    {
        Task<IReadOnlyList<AppointmentResponseDto>> GetAllAsync();

        Task<PagedResult<AppointmentResponseDto>> GetPagedAsync(
         int pageNumber,
         int pageSize);

        Task<AppointmentResponseDto?> GetByIdAsync(Guid id);

        Task<AppointmentResponseDto?> CreateAsync(
            CreateAppointmentDto dto);

        Task<AppointmentResponseDto?> UpdateAsync(
            Guid id,
            UpdateAppointmentDto dto);

        Task<AppointmentResponseDto?> UpdateStatusAsync(
            Guid id,
            UpdateAppointmentStatusDto dto);

        Task<bool> SoftDeleteAsync(Guid id);
    }
}