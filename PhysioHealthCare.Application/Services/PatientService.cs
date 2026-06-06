namespace PhysioHealthCare.Application.Services
{
    using PhysioHealthCare.Application.DTOs.Patients;
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
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                BirthDate = dto.BirthDate,
                Gender = (Gender)dto.Gender,
                PhoneNumber = dto.PhoneNumber.Trim(),
                Email = dto.Email.Trim(),
                Address = dto.Address.Trim(),
                Notes = dto.Notes.Trim(),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var newPatient = await _patientRepository.CreateAsync(patient);

            return MapToResponse(newPatient);
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