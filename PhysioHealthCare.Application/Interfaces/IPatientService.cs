namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.Patients;
    public interface IPatientService
    {
        Task<IReadOnlyList<PatientResponseDto>> GetAllAsync();
        Task<PatientResponseDto> GetByIdAsync(Guid id);
        Task<PatientResponseDto> CreateAsync(CreatePatientDto dto);
        Task<PatientResponseDto> UpdateAsync(Guid id, UpdatePatientDto dto);
        Task<bool> SoftDeleteAsync(Guid id);
    }
}
