namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Domain.Entities;
    public interface IAppointmentRepository
    {
        Task<IReadOnlyList<AppointmentResponseDto>> GetAllAsync();

        Task<(IReadOnlyList<AppointmentResponseDto> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize);

        Task<AppointmentResponseDto?> GetByIdAsync(Guid id);

        Task<Appointment?> GetByIdForUpdateAsync(Guid id);

        Task<Appointment> CreateAsync(
            Appointment appointment);

        Task<Appointment> UpdateAsync(
            Appointment appointment);

        Task<bool> SoftDeleteAsync(Guid id);
    }
}