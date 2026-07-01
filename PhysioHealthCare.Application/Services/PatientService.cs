namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.DTOs.Patients;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;
    using PhysioHealthCare.Infrastructure.Repositories;

    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<PatientService> _logger;

        public PatientService(
            IPatientRepository patientRepository,
            ILogger<PatientService> logger)
        {
            _patientRepository = patientRepository
                ?? throw new ArgumentNullException(nameof(patientRepository));

            _logger = logger
                ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IReadOnlyList<PatientResponseDto>> GetAllAsync()
        {
            _logger.LogInformation("Getting all active patients");

            var patients = await _patientRepository.GetAllAsync();

            _logger.LogInformation("Retrieved {PatientCount} active patients", patients.Count);

            return patients.Select(MapToResponse).ToList();
        }

        public async Task<PatientResponseDto> CreateAsync(CreatePatientDto dto)
        {
            _logger.LogInformation("Creating patient with email: {Email}", dto.Email);

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

            _logger.LogInformation("Patient created successfully. PatientId: {PatientId}", newPatient.Id);

            return MapToResponse(newPatient);
        }

        public async Task<PatientResponseDto?> UpdateAsync(Guid id, UpdatePatientDto dto)
        {
            _logger.LogInformation("Updating patient. PatientId: {PatientId}", id);

            var patient = await _patientRepository.GetByIdForUpdateAsync(id);

            if (patient == null)
            {
                _logger.LogWarning("Cannot update patient because it does not exist. PatientId: {PatientId}", id);
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

            _logger.LogInformation("Patient updated successfully. PatientId: {PatientId}", updatedPatient.Id);

            return MapToResponse(updatedPatient);
        }

        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            _logger.LogInformation("Soft deleting patient. PatientId: {PatientId}", id);

            var deleted = await _patientRepository.SoftDeleteAsync(id);

            if (!deleted)
            {
                _logger.LogWarning("Cannot soft delete patient because it does not exist. PatientId: {PatientId}", id);
                throw new NotFoundException("Patient not found.");
            }

            _logger.LogInformation("Patient soft deleted successfully. PatientId: {PatientId}", id);

            return deleted;
        }

        public async Task<PatientDetailDto> GetByIdAsync(Guid id)
        {
            _logger.LogInformation("Getting patient by id. PatientId: {PatientId}", id);

            var patient = await _patientRepository.GetByIdAsync(id);

            if (patient == null)
            {
                _logger.LogWarning("Patient not found. PatientId: {PatientId}", id);
                throw new NotFoundException("Patient not found.");
            }

            return new PatientDetailDto
            {
                Id = patient.Id,
                FirstName = patient.FirstName,
                LastName = patient.LastName,
                BirthDate = patient.BirthDate,
                Gender = (int)patient.Gender,
                PhoneNumber = patient.PhoneNumber,
                Email = patient.Email,
                Address = patient.Address,
                Notes = patient.Notes
            }; 
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
    }
}