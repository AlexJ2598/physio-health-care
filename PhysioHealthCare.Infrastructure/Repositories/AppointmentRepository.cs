namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Infrastructure.Data;

    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppDbContext _context;

        public AppointmentRepository(
            AppDbContext context)
        {
            _context = context
                ?? throw new ArgumentNullException(
                    nameof(context));
        }

        public async Task<Appointment> CreateAsync(
            Appointment appointment)
        {
            _context.Appointments.Add(
                appointment);

            await _context.SaveChangesAsync();

            return appointment;
        }

        public async Task<IReadOnlyList<AppointmentResponseDto>>
            GetAllAsync()
        {
            return await _context.Appointments
                .AsNoTracking()
                .Where(appointment =>
                    appointment.IsActive)
                .OrderBy(appointment =>
                    appointment.AppointmentDate)
                .Select(appointment =>
                    new AppointmentResponseDto
                    {
                        Id = appointment.Id,

                        PatientId =
                            appointment.PatientId,

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
                    })
                .ToListAsync();
        }

        public async Task<AppointmentResponseDto?>
            GetByIdAsync(Guid id)
        {
            return await _context.Appointments
                .AsNoTracking()
                .Where(appointment =>
                    appointment.IsActive
                    && appointment.Id == id)
                .Select(appointment =>
                    new AppointmentResponseDto
                    {
                        Id = appointment.Id,

                        PatientId =
                            appointment.PatientId,

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
                    })
                .FirstOrDefaultAsync();
        }

        public async Task<Appointment?>
            GetByIdForUpdateAsync(Guid id)
        {
            return await _context.Appointments
                .FirstOrDefaultAsync(
                    appointment =>
                        appointment.IsActive
                        && appointment.Id == id);
        }

        public async Task<bool>
            SoftDeleteAsync(Guid id)
        {
            var appointment =
                await _context.Appointments
                    .FirstOrDefaultAsync(
                        appointment =>
                            appointment.IsActive
                            && appointment.Id == id);

            if (appointment == null)
            {
                return false;
            }

            appointment.IsActive = false;
            appointment.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Appointment> UpdateAsync(
            Appointment appointment)
        {
            await _context.SaveChangesAsync();

            return appointment;
        }
    }
}