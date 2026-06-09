namespace PhysioHealthCare.Application.Services
{
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

        public AppointmentService(IAppointmentRepository appointmentRepository)
        {
            if (appointmentRepository == null) throw new ArgumentNullException(nameof(appointmentRepository));
            
            _appointmentsRepository = appointmentRepository;
        }
        public async Task<AppointmentResponseDto?> CreateAsync(CreateAppointmentDto dto)
        {
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

            return await _appointmentsRepository.GetByIdAsync(appointment.Id);
        }

        public async Task<IReadOnlyList<AppointmentResponseDto>> GetAllAsync()
        {
            var appointments = await _appointmentsRepository.GetAllAsync();

            return appointments;

        }

        public async Task<AppointmentResponseDto?> GetByIdAsync(Guid id)
        {
            var appointment = await _appointmentsRepository.GetByIdAsync(id);
            if(appointment == null)
            {
                throw new NotFoundException("Appointment not found.");
            }

            return appointment;
        }

        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            return await _appointmentsRepository.SoftDeleteAsync(id);
        }

        public async Task<AppointmentResponseDto?> UpdateAsync(Guid id, UpdateAppointmentDto dto)
        {
            var appointment = await _appointmentsRepository.GetByIdForUpdateAsync(id);

            if (appointment == null)
                throw new NotFoundException("Appointment not found.");

            appointment.AppointmentDate = dto.AppointmentDate;
            appointment.Reason = dto.Reason.Trim();
            appointment.Notes = dto.Notes?.Trim() ?? string.Empty;
            appointment.IsCompleted = dto.IsCompleted;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _appointmentsRepository.UpdateAsync(appointment);

            return await _appointmentsRepository.GetByIdAsync(id);
        }
    }
}
