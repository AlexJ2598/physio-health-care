namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;

    public interface IAppointmentRepository
    {
        Task<IReadOnlyList<Appointment>> GetAllAsync();

        Task<(IReadOnlyList<Appointment> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            Guid? patientId,
            AppointmentStatus? status,
            DateTime? dateFrom,
            DateTime? dateTo,
            string? search,
            string? sortBy,
            string? sortDirection);

        Task<Appointment?> GetByIdAsync(Guid id);

        Task<Appointment?> GetByIdForUpdateAsync(Guid id);

        Task<Appointment> CreateAsync(
            Appointment appointment);

        Task<Appointment> UpdateAsync(
            Appointment appointment);

        Task<bool> SoftDeleteAsync(Guid id);
    }
}