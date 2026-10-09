namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.DTOs.ClinicalRecords;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;

    public class ClinicalRecordService : IClinicalRecordService
    {
        private readonly IClinicalRecordRepository _clinicalRecordRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<ClinicalRecordService> _logger;

        public ClinicalRecordService(
            IClinicalRecordRepository clinicalRecordRepository,
            IPatientRepository patientRepository,
            ILogger<ClinicalRecordService> logger)
        {
            _clinicalRecordRepository = clinicalRecordRepository
                ?? throw new ArgumentNullException(
                    nameof(clinicalRecordRepository));

            _patientRepository = patientRepository
                ?? throw new ArgumentNullException(
                    nameof(patientRepository));

            _logger = logger
                ?? throw new ArgumentNullException(
                    nameof(logger));
        }

        public async Task<ClinicalRecordResponseDto?> GetByPatientIdAsync(
            Guid patientId)
        {
            _logger.LogInformation(
                "Getting clinical record for patient. PatientId: {PatientId}",
                patientId);

            var patient =
                await _patientRepository.GetByIdAsync(patientId);

            if (patient == null)
            {
                _logger.LogWarning(
                    "Cannot get clinical record because patient does not exist. PatientId: {PatientId}",
                    patientId);

                throw new NotFoundException(
                    "Patient not found.");
            }

            var clinicalRecord =
                await _clinicalRecordRepository
                    .GetByPatientIdAsync(patientId);

            if (clinicalRecord == null)
            {
                _logger.LogInformation(
                    "Clinical record does not exist for patient. PatientId: {PatientId}",
                    patientId);

                return null;
            }

            return MapToResponse(clinicalRecord);
        }

        public async Task<ClinicalRecordResponseDto> CreateAsync(
            Guid patientId)
        {
            _logger.LogInformation(
                "Creating clinical record for patient. PatientId: {PatientId}",
                patientId);

            var patient =
                await _patientRepository.GetByIdAsync(patientId);

            if (patient == null)
            {
                _logger.LogWarning(
                    "Cannot create clinical record because patient does not exist. PatientId: {PatientId}",
                    patientId);

                throw new NotFoundException(
                    "Patient not found.");
            }

            var clinicalRecordExists =
                await _clinicalRecordRepository
                    .ExistsForPatientIdAsync(patientId);

            if (clinicalRecordExists)
            {
                _logger.LogWarning(
                    "Cannot create clinical record because patient already has one. PatientId: {PatientId}",
                    patientId);

                throw new BadRequestException(
                    "Patient already has a clinical record.");
            }

            var sequenceNumber =
                await _clinicalRecordRepository
                    .GetNextRecordNumberAsync();

            var clinicalRecord = new ClinicalRecord
            {
                Id = Guid.NewGuid(),
                PatientId = patientId,
                RecordNumber =
                    $"PHC-{sequenceNumber:D6}",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var newClinicalRecord =
                await _clinicalRecordRepository
                    .CreateAsync(clinicalRecord);

            _logger.LogInformation(
                "Clinical record created successfully. ClinicalRecordId: {ClinicalRecordId}, RecordNumber: {RecordNumber}, PatientId: {PatientId}",
                newClinicalRecord.Id,
                newClinicalRecord.RecordNumber,
                patientId);

            return MapToResponse(newClinicalRecord);
        }

        private static ClinicalRecordResponseDto MapToResponse(
            ClinicalRecord clinicalRecord)
        {
            return new ClinicalRecordResponseDto
            {
                Id = clinicalRecord.Id,
                PatientId = clinicalRecord.PatientId,
                RecordNumber = clinicalRecord.RecordNumber,
                CreatedAt = clinicalRecord.CreatedAt,
                HasClinicalHistory =
                    clinicalRecord.ClinicalHistory != null &&
                    clinicalRecord.ClinicalHistory.IsActive
            };
        }
    }
}