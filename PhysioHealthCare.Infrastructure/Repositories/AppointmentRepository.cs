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
        public AppointmentRepository(AppDbContext context)
        {
            if(context == null) throw new ArgumentNullException("context");
            _context = context;
        }
        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<IReadOnlyList<AppointmentResponseDto>> GetAllAsync()
        {
            return await _context.Appointments.AsNoTracking().Where(appointment => appointment.IsActive)
                .OrderBy(appointment => appointment.AppointmentDate).Select(a => new AppointmentResponseDto
                {
                    Id = a.Id,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.FirstName + " " + a.Patient.LastName,
                    AppointmentDate = a.AppointmentDate,
                    Reason = a.Reason,
                    Notes = a.Notes,
                    IsCompleted = a.IsCompleted
                })
                .ToListAsync(); 
        }

        public async Task<AppointmentResponseDto?> GetByIdAsync(Guid id)
        {
            return await _context.Appointments
           .AsNoTracking()
           .Where(a => a.IsActive && a.Id == id)
           .Select(a => new AppointmentResponseDto
           {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = a.Patient.FirstName + " " + a.Patient.LastName,
            AppointmentDate = a.AppointmentDate,
            Reason = a.Reason,
            Notes = a.Notes,
            IsCompleted = a.IsCompleted
           })
        .FirstOrDefaultAsync();

        }

        public async Task<Appointment?> GetByIdForUpdateAsync(Guid id)
        {
            return await _context.Appointments.FirstOrDefaultAsync(appointment => appointment.IsActive && appointment.Id == id);
        }

        public async Task<bool> SoftDeleteAsync(Guid id)
        {
            var appointment = await _context.Appointments.FirstOrDefaultAsync(appointment => appointment.IsActive && appointment.Id == id);
            if (appointment == null)
            {
                return false;
            }
            appointment.IsActive = false;
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;

        }

        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            await _context.SaveChangesAsync();
            return appointment;
        }
    }
}
