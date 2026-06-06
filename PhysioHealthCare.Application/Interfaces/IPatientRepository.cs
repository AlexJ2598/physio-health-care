namespace PhysioHealthCare.Infrastructure.Repositories
{
    using PhysioHealthCare.Domain.Entities;
    public interface IPatientRepository
    {
        Task<IReadOnlyList<Patient>> GetAllAsync();

        Task<Patient?> GetByIdAsync(Guid id);

        Task<Patient> CreateAsync(Patient patient);
    }
}
