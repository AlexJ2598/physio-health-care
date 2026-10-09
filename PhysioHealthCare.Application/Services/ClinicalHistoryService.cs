namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.DTOs.ClinicalRecords;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;

    public class ClinicalHistoryService : IClinicalHistoryService
    {
        private readonly IClinicalRecordRepository _clinicalRecordRepository;
        private readonly IClinicalHistoryRepository _clinicalHistoryRepository;
        private readonly ILogger<ClinicalHistoryService> _logger;

        public ClinicalHistoryService(
            IClinicalRecordRepository clinicalRecordRepository,
            IClinicalHistoryRepository clinicalHistoryRepository,
            ILogger<ClinicalHistoryService> logger)
        {
            _clinicalRecordRepository = clinicalRecordRepository
                ?? throw new ArgumentNullException(
                    nameof(clinicalRecordRepository));

            _clinicalHistoryRepository = clinicalHistoryRepository
                ?? throw new ArgumentNullException(
                    nameof(clinicalHistoryRepository));

            _logger = logger
                ?? throw new ArgumentNullException(
                    nameof(logger));
        }

        public async Task<ClinicalHistoryResponseDto?> GetByClinicalRecordIdAsync(
            Guid clinicalRecordId)
        {
            _logger.LogInformation(
                "Getting clinical history. ClinicalRecordId: {ClinicalRecordId}",
                clinicalRecordId);

            var clinicalRecord =
                await _clinicalRecordRepository
                    .GetByIdAsync(clinicalRecordId);

            if (clinicalRecord == null)
            {
                _logger.LogWarning(
                    "Cannot get clinical history because clinical record does not exist. ClinicalRecordId: {ClinicalRecordId}",
                    clinicalRecordId);

                throw new NotFoundException(
                    "Clinical record not found.");
            }

            var clinicalHistory =
                await _clinicalHistoryRepository
                    .GetByClinicalRecordIdAsync(clinicalRecordId);

            if (clinicalHistory == null)
            {
                _logger.LogInformation(
                    "Clinical history does not exist. ClinicalRecordId: {ClinicalRecordId}",
                    clinicalRecordId);

                return null;
            }

            return MapToResponse(clinicalHistory);
        }

        public async Task<ClinicalHistoryResponseDto> CreateAsync(
            Guid clinicalRecordId,
            CreateClinicalHistoryDto dto)
        {
            _logger.LogInformation(
                "Creating clinical history. ClinicalRecordId: {ClinicalRecordId}",
                clinicalRecordId);

            var clinicalRecord =
                await _clinicalRecordRepository
                    .GetByIdAsync(clinicalRecordId);

            if (clinicalRecord == null)
            {
                _logger.LogWarning(
                    "Cannot create clinical history because clinical record does not exist. ClinicalRecordId: {ClinicalRecordId}",
                    clinicalRecordId);

                throw new NotFoundException(
                    "Clinical record not found.");
            }

            var historyExists =
                await _clinicalHistoryRepository
                    .ExistsForClinicalRecordIdAsync(
                        clinicalRecordId);

            if (historyExists)
            {
                _logger.LogWarning(
                    "Cannot create clinical history because one already exists. ClinicalRecordId: {ClinicalRecordId}",
                    clinicalRecordId);

                throw new BadRequestException(
                    "Clinical record already has a clinical history.");
            }

            var clinicalHistory = new ClinicalHistory
            {
                Id = Guid.NewGuid(),
                ClinicalRecordId = clinicalRecordId,

                ChiefComplaint =
                    dto.ChiefComplaint.Trim(),

                CurrentCondition =
                    dto.CurrentCondition?.Trim(),

                ConditionOnsetDate =
                    dto.ConditionOnsetDate,

                InjuryMechanism =
                    dto.InjuryMechanism?.Trim(),

                RelevantMedicalHistory =
                    dto.RelevantMedicalHistory?.Trim(),

                PreviousSurgeries =
                    dto.PreviousSurgeries?.Trim(),

                PreviousInjuries =
                    dto.PreviousInjuries?.Trim(),

                Allergies =
                    dto.Allergies?.Trim(),

                CurrentMedications =
                    dto.CurrentMedications?.Trim(),

                MedicalDiagnosis =
                    dto.MedicalDiagnosis?.Trim(),

                ReferringPhysician =
                    dto.ReferringPhysician?.Trim(),

                PreviousStudies =
                    dto.PreviousStudies?.Trim(),

                PainLevel =
                    dto.PainLevel,

                FunctionalLimitations =
                    dto.FunctionalLimitations?.Trim(),

                PhysicalTherapyAssessment =
                    dto.PhysicalTherapyAssessment?.Trim(),

                PhysicalTherapyDiagnosis =
                    dto.PhysicalTherapyDiagnosis?.Trim(),

                Notes =
                    dto.Notes?.Trim(),

                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var newClinicalHistory =
                await _clinicalHistoryRepository
                    .CreateAsync(clinicalHistory);

            _logger.LogInformation(
                "Clinical history created successfully. ClinicalHistoryId: {ClinicalHistoryId}, ClinicalRecordId: {ClinicalRecordId}",
                newClinicalHistory.Id,
                clinicalRecordId);

            return MapToResponse(newClinicalHistory);
        }

        public async Task<ClinicalHistoryResponseDto> UpdateAsync(
            Guid clinicalRecordId,
            UpdateClinicalHistoryDto dto)
        {
            _logger.LogInformation(
                "Updating clinical history. ClinicalRecordId: {ClinicalRecordId}",
                clinicalRecordId);

            var clinicalRecord =
                await _clinicalRecordRepository
                    .GetByIdAsync(clinicalRecordId);

            if (clinicalRecord == null)
            {
                _logger.LogWarning(
                    "Cannot update clinical history because clinical record does not exist. ClinicalRecordId: {ClinicalRecordId}",
                    clinicalRecordId);

                throw new NotFoundException(
                    "Clinical record not found.");
            }

            var clinicalHistory =
                await _clinicalHistoryRepository
                    .GetByClinicalRecordIdAsync(
                        clinicalRecordId);

            if (clinicalHistory == null)
            {
                _logger.LogWarning(
                    "Cannot update clinical history because it does not exist. ClinicalRecordId: {ClinicalRecordId}",
                    clinicalRecordId);

                throw new NotFoundException(
                    "Clinical history not found.");
            }

            clinicalHistory.ChiefComplaint =
                dto.ChiefComplaint.Trim();

            clinicalHistory.CurrentCondition =
                dto.CurrentCondition?.Trim();

            clinicalHistory.ConditionOnsetDate =
                dto.ConditionOnsetDate;

            clinicalHistory.InjuryMechanism =
                dto.InjuryMechanism?.Trim();

            clinicalHistory.RelevantMedicalHistory =
                dto.RelevantMedicalHistory?.Trim();

            clinicalHistory.PreviousSurgeries =
                dto.PreviousSurgeries?.Trim();

            clinicalHistory.PreviousInjuries =
                dto.PreviousInjuries?.Trim();

            clinicalHistory.Allergies =
                dto.Allergies?.Trim();

            clinicalHistory.CurrentMedications =
                dto.CurrentMedications?.Trim();

            clinicalHistory.MedicalDiagnosis =
                dto.MedicalDiagnosis?.Trim();

            clinicalHistory.ReferringPhysician =
                dto.ReferringPhysician?.Trim();

            clinicalHistory.PreviousStudies =
                dto.PreviousStudies?.Trim();

            clinicalHistory.PainLevel =
                dto.PainLevel;

            clinicalHistory.FunctionalLimitations =
                dto.FunctionalLimitations?.Trim();

            clinicalHistory.PhysicalTherapyAssessment =
                dto.PhysicalTherapyAssessment?.Trim();

            clinicalHistory.PhysicalTherapyDiagnosis =
                dto.PhysicalTherapyDiagnosis?.Trim();

            clinicalHistory.Notes =
                dto.Notes?.Trim();

            clinicalHistory.UpdatedAt =
                DateTime.UtcNow;

            var updatedClinicalHistory =
                await _clinicalHistoryRepository
                    .UpdateAsync(clinicalHistory);

            _logger.LogInformation(
                "Clinical history updated successfully. ClinicalHistoryId: {ClinicalHistoryId}, ClinicalRecordId: {ClinicalRecordId}",
                updatedClinicalHistory.Id,
                clinicalRecordId);

            return MapToResponse(updatedClinicalHistory);
        }

        private static ClinicalHistoryResponseDto MapToResponse(
            ClinicalHistory clinicalHistory)
        {
            return new ClinicalHistoryResponseDto
            {
                Id = clinicalHistory.Id,
                ClinicalRecordId =
                    clinicalHistory.ClinicalRecordId,

                ChiefComplaint =
                    clinicalHistory.ChiefComplaint,

                CurrentCondition =
                    clinicalHistory.CurrentCondition,

                ConditionOnsetDate =
                    clinicalHistory.ConditionOnsetDate,

                InjuryMechanism =
                    clinicalHistory.InjuryMechanism,

                RelevantMedicalHistory =
                    clinicalHistory.RelevantMedicalHistory,

                PreviousSurgeries =
                    clinicalHistory.PreviousSurgeries,

                PreviousInjuries =
                    clinicalHistory.PreviousInjuries,

                Allergies =
                    clinicalHistory.Allergies,

                CurrentMedications =
                    clinicalHistory.CurrentMedications,

                MedicalDiagnosis =
                    clinicalHistory.MedicalDiagnosis,

                ReferringPhysician =
                    clinicalHistory.ReferringPhysician,

                PreviousStudies =
                    clinicalHistory.PreviousStudies,

                PainLevel =
                    clinicalHistory.PainLevel,

                FunctionalLimitations =
                    clinicalHistory.FunctionalLimitations,

                PhysicalTherapyAssessment =
                    clinicalHistory.PhysicalTherapyAssessment,

                PhysicalTherapyDiagnosis =
                    clinicalHistory.PhysicalTherapyDiagnosis,

                Notes =
                    clinicalHistory.Notes,

                CreatedAt =
                    clinicalHistory.CreatedAt,

                UpdatedAt =
                    clinicalHistory.UpdatedAt
            };
        }
    }
}