namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.ClinicalRecords;

    public interface IClinicalRecordService
    {
        Task<ClinicalRecordResponseDto?> GetByPatientIdAsync(
            Guid patientId);

        Task<ClinicalRecordResponseDto> CreateAsync(
            Guid patientId);
    }
}