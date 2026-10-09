namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.ClinicalRecords;

    public interface IClinicalHistoryService
    {
        Task<ClinicalHistoryResponseDto?> GetByClinicalRecordIdAsync(
            Guid clinicalRecordId);

        Task<ClinicalHistoryResponseDto> CreateAsync(
            Guid clinicalRecordId,
            CreateClinicalHistoryDto dto);

        Task<ClinicalHistoryResponseDto> UpdateAsync(
            Guid clinicalRecordId,
            UpdateClinicalHistoryDto dto);
    }
}