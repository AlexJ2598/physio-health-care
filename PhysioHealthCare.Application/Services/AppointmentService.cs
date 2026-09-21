namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.DTOs.Common;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;

    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentsRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IPatientRepository patientRepository,
            ILogger<AppointmentService> logger)
        {
            _appointmentsRepository = appointmentRepository
                ?? throw new ArgumentNullException(
                    nameof(appointmentRepository));

            _patientRepository = patientRepository
                ?? throw new ArgumentNullException(
                    nameof(patientRepository));

            _logger = logger
                ?? throw new ArgumentNullException(
                    nameof(logger));
        }

        public async Task<AppointmentResponseDto> CreateAsync(
            CreateAppointmentDto dto)
        {
            _logger.LogInformation(
                "Creating appointment for PatientId: {PatientId}",
                dto.PatientId);

            var patient =
                await _patientRepository.GetByIdAsync(dto.PatientId);

            if (patient == null)
            {
                _logger.LogWarning(
                    "Cannot create appointment because patient does not exist or is inactive. PatientId: {PatientId}",
                    dto.PatientId);

                throw new NotFoundException(
                    "Patient not found.");
            }

            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                AppointmentDate = dto.AppointmentDate,
                Reason = dto.Reason.Trim(),
                Notes = dto.Notes?.Trim() ?? string.Empty,
                Status = AppointmentStatus.Scheduled,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _appointmentsRepository.CreateAsync(
                appointment);

            _logger.LogInformation(
                "Appointment created successfully. AppointmentId: {AppointmentId}",
                appointment.Id);

            var createdAppointment =
                await _appointmentsRepository
                .GetByIdAsync(appointment.Id);

            if (createdAppointment == null)
            {
                throw new NotFoundException(
                    "Appointment not found.");
            }

            return MapToResponse(
                createdAppointment);
        }

        public async Task<IReadOnlyList<AppointmentResponseDto>>GetAllAsync()
        {
            _logger.LogInformation(
                "Getting all appointments");

            var appointments =
                await _appointmentsRepository.GetAllAsync();

            var items =
                appointments
                    .Select(MapToResponse)
                    .ToList();

            _logger.LogInformation(
                "Retrieved {AppointmentCount} appointments",
                items.Count);

            return items;
        }

        public async Task<AppointmentResponseDto>GetByIdAsync(Guid id)
        {
            _logger.LogInformation(
                "Getting appointment. AppointmentId: {AppointmentId}",
                id);

            var appointment =
                await _appointmentsRepository.GetByIdAsync(id);

            if (appointment == null)
            {
                _logger.LogWarning(
                    "Appointment not found. AppointmentId: {AppointmentId}",
                    id);

                throw new NotFoundException(
                    "Appointment not found.");
            }

            return MapToResponse(appointment);
        }

        public async Task SoftDeleteAsync(Guid id)
        {
            _logger.LogInformation(
                "Soft deleting appointment. AppointmentId: {AppointmentId}",
                id);

            var deleted =
                await _appointmentsRepository.SoftDeleteAsync(id);

            if (!deleted)
            {
                _logger.LogWarning(
                    "Cannot delete appointment because it does not exist. AppointmentId: {AppointmentId}",
                    id);

                throw new NotFoundException(
                    "Appointment not found.");
            }

            _logger.LogInformation(
                "Appointment deleted successfully. AppointmentId: {AppointmentId}",
                id);
        }

        public async Task<AppointmentResponseDto> UpdateAsync(
            Guid id,
            UpdateAppointmentDto dto)
        {
            _logger.LogInformation(
                "Updating appointment. AppointmentId: {AppointmentId}",
                id);

            var appointment =
                await _appointmentsRepository
                    .GetByIdForUpdateAsync(id);

            if (appointment == null)
            {
                _logger.LogWarning(
                    "Cannot update appointment because it does not exist. AppointmentId: {AppointmentId}",
                    id);

                throw new NotFoundException(
                    "Appointment not found.");
            }

            appointment.AppointmentDate =
                dto.AppointmentDate;

            appointment.Reason =
                dto.Reason.Trim();

            appointment.Notes =
                dto.Notes?.Trim() ?? string.Empty;

            appointment.UpdatedAt =
                DateTime.UtcNow;

            await _appointmentsRepository
                .UpdateAsync(appointment);

            _logger.LogInformation(
                "Appointment updated successfully. AppointmentId: {AppointmentId}",
                id);

            var updatedAppointment =
            await _appointmentsRepository
            .GetByIdAsync(appointment.Id);

            if (updatedAppointment == null)
            {
                throw new NotFoundException(
                    "Appointment not found.");
            }

            return MapToResponse(
                updatedAppointment);
        }

        public async Task<AppointmentResponseDto> UpdateStatusAsync(Guid id, UpdateAppointmentStatusDto dto)
        {
            _logger.LogInformation(
                "Updating status for AppointmentId: {AppointmentId} to {Status}",
                id,
                dto.Status);

            var appointment = await _appointmentsRepository.GetByIdForUpdateAsync(id);

            if (appointment == null)
            {
                _logger.LogWarning(
                    "Appointment not found. AppointmentId: {AppointmentId}",
                    id);

                throw new NotFoundException(
                    "Appointment not found.");
            }

            if (!IsValidStatusTransition(
                    appointment.Status,
                    dto.Status))
            {
                _logger.LogWarning(
                    "Invalid appointment status transition. AppointmentId: {AppointmentId}, CurrentStatus: {CurrentStatus}, NewStatus: {NewStatus}",
                    id,
                    appointment.Status,
                    dto.Status);

                throw new ConflictException(
                    $"Cannot change appointment status from {appointment.Status} to {dto.Status}.");
            }

            appointment.Status = dto.Status;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _appointmentsRepository.UpdateAsync(appointment);

            _logger.LogInformation(
                "Appointment status updated successfully. AppointmentId: {AppointmentId}, Status: {Status}",
                id,
                appointment.Status);

            var updatedAppointment =
             await _appointmentsRepository
            .GetByIdAsync(id);

            if (updatedAppointment == null)
            {
                throw new NotFoundException(
                    "Appointment not found.");
            }

            return MapToResponse(
                updatedAppointment);
        }

        private static bool IsValidStatusTransition(AppointmentStatus currentStatus,AppointmentStatus newStatus)
        {
            if (currentStatus == newStatus)
            {
                return true;
            }

            return currentStatus switch
            {
                AppointmentStatus.Scheduled =>
                    newStatus is
                        AppointmentStatus.InProgress or
                        AppointmentStatus.Cancelled,

                AppointmentStatus.InProgress =>
                    newStatus is
                        AppointmentStatus.Completed or
                        AppointmentStatus.Cancelled,

                AppointmentStatus.Completed => false,

                AppointmentStatus.Cancelled => false,

                _ => false
            };
        }

        public async Task<PagedResult<AppointmentResponseDto>>GetPagedAsync(
        int pageNumber,
        int pageSize,
        Guid? patientId,
        AppointmentStatus? status,
        DateTime? dateFrom,
        DateTime? dateTo,
        string? search,
        string? sortBy,
        string? sortDirection)
        {
            _logger.LogInformation(
                "Getting paged appointments. PageNumber: {PageNumber}, PageSize: {PageSize}, PatientId: {PatientId}, Status: {Status}, DateFrom: {DateFrom}, DateTo: {DateTo}, Search: {Search}, SortBy: {SortBy}, SortDirection: {SortDirection}",
                pageNumber,
                pageSize,
                patientId,
                status,
                dateFrom,
                dateTo,
                search,
                sortBy,
                sortDirection);

            var result =
                await _appointmentsRepository.GetPagedAsync(
                    pageNumber,
                    pageSize,
                    patientId,
                    status,
                    dateFrom,
                    dateTo,
                    search,
                    sortBy,
                    sortDirection);

            var items =
                result.Items
                    .Select(MapToResponse)
                    .ToList();

            return new PagedResult<AppointmentResponseDto>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = result.TotalCount
            };
        }

        private static AppointmentResponseDto MapToResponse(Appointment appointment)
        {
            return new AppointmentResponseDto
            {
                Id = appointment.Id,

                PatientId = appointment.PatientId,

                PatientName =
                    appointment.Patient.FirstName
                    + " "
                    + appointment.Patient.LastName,

                AppointmentDate =
                    appointment.AppointmentDate,

                Reason =
                    appointment.Reason,

                Notes =
                    appointment.Notes,

                Status =
                    appointment.Status.ToString()
            };
        }
    }
}