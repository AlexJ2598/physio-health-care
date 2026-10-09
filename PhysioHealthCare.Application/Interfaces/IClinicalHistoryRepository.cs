namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Domain.Entities;

    public interface IClinicalHistoryRepository
    {
        Task<ClinicalHistory?> GetByIdAsync(Guid id);

        Task<ClinicalHistory?> GetByClinicalRecordIdAsync(
            Guid clinicalRecordId);

        Task<bool> ExistsForClinicalRecordIdAsync(
            Guid clinicalRecordId);

        Task<ClinicalHistory> CreateAsync(
            ClinicalHistory clinicalHistory);

        Task<ClinicalHistory> UpdateAsync(
            ClinicalHistory clinicalHistory);
    }
}