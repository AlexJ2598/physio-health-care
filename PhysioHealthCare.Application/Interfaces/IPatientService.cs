namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.Common;
    using PhysioHealthCare.Application.DTOs.Patients;

    public interface IPatientService
    {
        Task<IReadOnlyList<PatientResponseDto>> GetAllAsync();

        Task<PagedResult<PatientResponseDto>> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            string? sortBy,
            string? sortDirection);

        Task<PatientDetailDto> GetByIdAsync(Guid id);

        Task<PatientResponseDto> CreateAsync(
            CreatePatientDto dto);

        Task<PatientResponseDto?> UpdateAsync(
            Guid id,
            UpdatePatientDto dto);

        Task<bool> SoftDeleteAsync(Guid id);
    }
}