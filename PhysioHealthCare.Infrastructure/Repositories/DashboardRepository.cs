namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;
    using PhysioHealthCare.Infrastructure.Data;

    public class DashboardRepository : IDashboardRepository
    {
        private readonly AppDbContext _context;

        public DashboardRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<int> CountAppointmentsAsync(DateTime dateFrom, DateTime dateTo, AppointmentStatus? status = null)
        {
            var query = _context.Appointments.AsNoTracking()
                .Where(d => d.AppointmentDate >= dateFrom && d.AppointmentDate <= dateTo);
            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }
            return await query.CountAsync();
        }

        public async Task<int> CountAppointmentsBeforeAsync(DateTime before, AppointmentStatus status)
        {
            var query = _context.Appointments.AsNoTracking().
                Where(d => d.AppointmentDate < before && d.Status == status);
            return await query.CountAsync();
        }

        public Task<Appointment?> GetNextScheduledAppointmentAsync(DateTime from, DateTime to)
        {
            var query = _context.Appointments
                .AsNoTracking()
                .Include(a => a.Patient)
                .Where(a => a.AppointmentDate >= from && a.AppointmentDate <= to &&
                a.Status == AppointmentStatus.Scheduled)
                .OrderBy(d => d.AppointmentDate)
                .FirstOrDefaultAsync();

            return query;
        }
    }
}
