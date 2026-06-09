namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentsRepository;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            ILogger<AppointmentService> logger)
        {
            _appointmentsRepository = appointmentRepository
                ?? throw new ArgumentNullException(nameof(appointmentRepository));

            _logger = logger
                ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<AppointmentResponseDto?> CreateAsync(CreateAppointmentDto dto)
        {
            _logger.LogInformation(
                "Creating appointment for PatientId: {PatientId}",
                dto.PatientId);

            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                AppointmentDate = dto.AppointmentDate,
                Reason = dto.Reason.Trim(),
                Notes = dto.Notes?.Trim() ?? string.Empty,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _appointmentsRepository.CreateAsync(appointment);

            _logger.LogInformation(
                "Appointment created successfully. AppointmentId: {AppointmentId}",
                appointment.Id);

            return await _appointmentsRepository.GetByIdAsync(appointment.Id);
        }

        public async Task<IReadOnlyList<AppointmentResponseDto>> GetAllAsync()
        {
            _logger.LogInformation("Getting all appointments");

            var appointments = await _appointmentsRepository.GetAllAsync();

            _logger.LogInformation(
                "Retrieved {AppointmentCount} appointments",
                appointments.Count);

            return appointments;
        }

        public async Task<AppointmentResponseDto?> GetByIdAsync(Guid id)
        {
            _logger.LogInformation(
                "Getting appointment. AppointmentId: {AppointmentId}",
                id);

            var appointment = await _appointmentsRepository.GetByIdAsync(id);

            if (appointment == null)
            {
                _logger.LogWarning(
                    "Appointment not found. AppointmentId: {AppointmentId}",
                    id);

                throw new NotFoundException("Appointment not found.");
            }

            return appointment;
        }

        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            _logger.LogInformation(
                "Soft deleting appointment. AppointmentId: {AppointmentId}",
                id);

            var deleted = await _appointmentsRepository.SoftDeleteAsync(id);

            if (!deleted)
            {
                _logger.LogWarning(
                    "Cannot delete appointment because it does not exist. AppointmentId: {AppointmentId}",
                    id);

                throw new NotFoundException("Appointment not found.");
            }

            _logger.LogInformation(
                "Appointment deleted successfully. AppointmentId: {AppointmentId}",
                id);

            return deleted;
        }

        public async Task<AppointmentResponseDto?> UpdateAsync(Guid id, UpdateAppointmentDto dto)
        {
            _logger.LogInformation(
                "Updating appointment. AppointmentId: {AppointmentId}",
                id);

            var appointment = await _appointmentsRepository.GetByIdForUpdateAsync(id);

            if (appointment == null)
            {
                _logger.LogWarning(
                    "Cannot update appointment because it does not exist. AppointmentId: {AppointmentId}",
                    id);

                throw new NotFoundException("Appointment not found.");
            }

            appointment.AppointmentDate = dto.AppointmentDate;
            appointment.Reason = dto.Reason.Trim();
            appointment.Notes = dto.Notes?.Trim() ?? string.Empty;
            appointment.IsCompleted = dto.IsCompleted;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _appointmentsRepository.UpdateAsync(appointment);

            _logger.LogInformation(
                "Appointment updated successfully. AppointmentId: {AppointmentId}",
                id);

            return await _appointmentsRepository.GetByIdAsync(id);
        }
    }
}