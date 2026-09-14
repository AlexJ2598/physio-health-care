namespace PhysioHealthCare.Infrastructure.Repositories
{
    using PhysioHealthCare.Domain.Entities;
    public interface IPatientRepository
    {
        Task<IReadOnlyList<Patient>> GetAllAsync();

        Task<Patient?> GetByIdAsync(Guid id);

        Task<(IReadOnlyList<Patient> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search);

        Task<Patient> CreateAsync(Patient patient);

        Task<Patient> UpdateAsync(Patient patient);
        Task<Patient?> GetByIdForUpdateAsync(Guid id);
        Task<bool> SoftDeleteAsync(Guid id);
    }
}
