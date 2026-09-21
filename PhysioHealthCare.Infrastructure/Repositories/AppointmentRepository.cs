namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;
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

        public async Task<IReadOnlyList<Appointment>>
            GetAllAsync()
        {
            return await _context.Appointments
                .AsNoTracking()
                .Include(appointment =>
                    appointment.Patient)
                .Where(appointment =>
                    appointment.IsActive)
                .OrderBy(appointment =>
                    appointment.AppointmentDate)
                .ThenBy(appointment =>
                    appointment.Id)
                .ToListAsync();
        }

        public async Task<Appointment?>
            GetByIdAsync(Guid id)
        {
            return await _context.Appointments
                .AsNoTracking()
                .Include(appointment =>
                    appointment.Patient)
                .FirstOrDefaultAsync(
                    appointment =>
                        appointment.IsActive &&
                        appointment.Id == id);
        }

        public async Task<Appointment?>
            GetByIdForUpdateAsync(Guid id)
        {
            return await _context.Appointments
                .FirstOrDefaultAsync(
                    appointment =>
                        appointment.IsActive &&
                        appointment.Id == id);
        }

        public async Task<(
            IReadOnlyList<Appointment> Items,
            int TotalCount)> GetPagedAsync(
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
            var query =
                _context.Appointments
                    .AsNoTracking()
                    .Include(appointment =>
                        appointment.Patient)
                    .Where(appointment =>
                        appointment.IsActive);

            if (patientId.HasValue)
            {
                query =
                    query.Where(appointment =>
                        appointment.PatientId ==
                        patientId.Value);
            }

            if (status.HasValue)
            {
                query =
                    query.Where(appointment =>
                        appointment.Status ==
                        status.Value);
            }

            if (dateFrom.HasValue)
            {
                query =
                    query.Where(appointment =>
                        appointment.AppointmentDate >=
                        dateFrom.Value);
            }

            if (dateTo.HasValue)
            {
                query =
                    query.Where(appointment =>
                        appointment.AppointmentDate <=
                        dateTo.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm =
                    search.Trim();

                query =
                    query.Where(appointment =>
                        appointment.Reason.Contains(
                            searchTerm) ||
                        appointment.Notes.Contains(
                            searchTerm) ||
                        appointment.Patient.FirstName.Contains(
                            searchTerm) ||
                        appointment.Patient.LastName.Contains(
                            searchTerm) ||
                        (appointment.Patient.FirstName + " " +
                         appointment.Patient.LastName).Contains(
                            searchTerm));
            }

            var totalCount =
                await query.CountAsync();

            var normalizedSortBy =
                sortBy?.Trim().ToLowerInvariant();

            var descending =
                string.Equals(
                    sortDirection,
                    "desc",
                    StringComparison.OrdinalIgnoreCase);

            var orderedQuery =
                normalizedSortBy switch
                {
                    "appointmentdate" =>
                        descending
                            ? query
                                .OrderByDescending(
                                    appointment =>
                                        appointment.AppointmentDate)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id)
                            : query
                                .OrderBy(
                                    appointment =>
                                        appointment.AppointmentDate)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id),

                    "patientname" =>
                        descending
                            ? query
                                .OrderByDescending(
                                    appointment =>
                                        appointment.Patient.FirstName)
                                .ThenByDescending(
                                    appointment =>
                                        appointment.Patient.LastName)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id)
                            : query
                                .OrderBy(
                                    appointment =>
                                        appointment.Patient.FirstName)
                                .ThenBy(
                                    appointment =>
                                        appointment.Patient.LastName)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id),

                    "status" =>
                        descending
                            ? query
                                .OrderByDescending(
                                    appointment =>
                                        appointment.Status)
                                .ThenBy(
                                    appointment =>
                                        appointment.AppointmentDate)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id)
                            : query
                                .OrderBy(
                                    appointment =>
                                        appointment.Status)
                                .ThenBy(
                                    appointment =>
                                        appointment.AppointmentDate)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id),

                    "reason" =>
                        descending
                            ? query
                                .OrderByDescending(
                                    appointment =>
                                        appointment.Reason)
                                .ThenBy(
                                    appointment =>
                                        appointment.AppointmentDate)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id)
                            : query
                                .OrderBy(
                                    appointment =>
                                        appointment.Reason)
                                .ThenBy(
                                    appointment =>
                                        appointment.AppointmentDate)
                                .ThenBy(
                                    appointment =>
                                        appointment.Id),

                    _ =>
                        query
                            .OrderBy(
                                appointment =>
                                    appointment.AppointmentDate)
                            .ThenBy(
                                appointment =>
                                    appointment.Id)
                };

            var items =
                await orderedQuery
                    .Skip(
                        (pageNumber - 1) *
                        pageSize)
                    .Take(pageSize)
                    .ToListAsync();

            return (
                items,
                totalCount);
        }

        public async Task<bool>
            SoftDeleteAsync(Guid id)
        {
            var appointment =
                await _context.Appointments
                    .FirstOrDefaultAsync(
                        appointment =>
                            appointment.IsActive &&
                            appointment.Id == id);

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