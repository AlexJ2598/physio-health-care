namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Domain.Entities;

    public interface IClinicalRecordRepository
    {
        Task<ClinicalRecord?> GetByIdAsync(Guid id);

        Task<ClinicalRecord?> GetByPatientIdAsync(Guid patientId);

        Task<bool> ExistsForPatientIdAsync(Guid patientId);

        Task<long> GetNextRecordNumberAsync();

        Task<ClinicalRecord> CreateAsync(
            ClinicalRecord clinicalRecord);
    }
}