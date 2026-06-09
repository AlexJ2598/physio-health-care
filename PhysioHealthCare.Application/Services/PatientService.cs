namespace PhysioHealthCare.Application.Services
{
    using PhysioHealthCare.Application.DTOs.Patients;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;
    using PhysioHealthCare.Infrastructure.Repositories;

    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;

        public PatientService(IPatientRepository patientRepository)
        {
            _patientRepository = patientRepository
                ?? throw new ArgumentNullException(nameof(patientRepository));
        }

        public async Task<IReadOnlyList<PatientResponseDto>> GetAllAsync()
        {
            var patients = await _patientRepository.GetAllAsync();

            return patients.Select(MapToResponse).ToList();
        }

        public async Task<PatientResponseDto> CreateAsync(CreatePatientDto dto)
        {
            var patient = new Patient
            {
                Id = Guid.NewGuid(),
                FirstName = dto.FirstName?.Trim() ?? string.Empty,
                LastName = dto.LastName?.Trim() ?? string.Empty,
                BirthDate = dto.BirthDate,
                Gender = (Gender)dto.Gender,
                PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty,
                Email = dto.Email?.Trim() ?? string.Empty,
                Address = dto.Address?.Trim() ?? string.Empty,
                Notes = dto.Notes?.Trim() ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var newPatient = await _patientRepository.CreateAsync(patient);

            return MapToResponse(newPatient);
        }

        public async Task<PatientResponseDto?> UpdateAsync(Guid id, UpdatePatientDto dto)
        {
            var patient = await _patientRepository.GetByIdForUpdateAsync(id);

            if (patient == null)
            {
                throw new BadRequestException("Patient does not exist.");
            }

            patient.FirstName = dto.FirstName.Trim();
            patient.LastName = dto.LastName.Trim();
            patient.BirthDate = dto.BirthDate;
            patient.Gender = (Gender)dto.Gender;
            patient.PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty;
            patient.Email = dto.Email?.Trim() ?? string.Empty;
            patient.Address = dto.Address?.Trim() ?? string.Empty;
            patient.Notes = dto.Notes?.Trim() ?? string.Empty;
            patient.UpdatedAt = DateTime.UtcNow;

            var updatedPatient = await _patientRepository.UpdateAsync(patient);

            return MapToResponse(updatedPatient);
        }

        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            return await _patientRepository.SoftDeleteAsync(id);
        }

        private static PatientResponseDto MapToResponse(Patient patient)
        {
            return new PatientResponseDto
            {
                Id = patient.Id,
                FullName = $"{patient.FirstName} {patient.LastName}",
                BirthDate = patient.BirthDate,
                Gender = patient.Gender.ToString(),
                PhoneNumber = patient.PhoneNumber,
                Email = patient.Email
            };
        }

        public async Task<PatientResponseDto> GetByIdAsync(Guid id)
        {

            var patient = await _patientRepository.GetByIdAsync(id);
            if(patient == null)
            {
                throw new BadRequestException("Patient does not exist.");
            }

            return MapToResponse(patient);
        }
    }
}