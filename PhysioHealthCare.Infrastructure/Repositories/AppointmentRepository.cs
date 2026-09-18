namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Application.DTOs.Appointments;
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

        public async Task<(
    IReadOnlyList<AppointmentResponseDto> Items,int TotalCount)> GetPagedAsync(
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
                search = search.Trim();

                query =
                    query.Where(appointment =>
                        appointment.Reason.Contains(search) ||
                        appointment.Notes.Contains(search) ||
                        appointment.Patient.FirstName.Contains(search) ||
                        appointment.Patient.LastName.Contains(search) ||
                        (appointment.Patient.FirstName + " " +
                         appointment.Patient.LastName).Contains(search));
            }

            var totalCount =
                await query.CountAsync();

            var orderedQuery =
                sortBy?.ToLower() switch
                {
                    "appointmentdate" =>
                        sortDirection?.ToLower() == "desc"
                            ? query.OrderByDescending(
                                appointment =>
                                    appointment.AppointmentDate)
                            : query.OrderBy(
                                appointment =>
                                    appointment.AppointmentDate),

                    "patientname" =>
                        sortDirection?.ToLower() == "desc"
                            ? query
                                .OrderByDescending(
                                    appointment =>
                                        appointment.Patient.FirstName)
                                .ThenByDescending(
                                    appointment =>
                                        appointment.Patient.LastName)
                            : query
                                .OrderBy(
                                    appointment =>
                                        appointment.Patient.FirstName)
                                .ThenBy(
                                    appointment =>
                                        appointment.Patient.LastName),

                    "status" =>
                        sortDirection?.ToLower() == "desc"
                            ? query.OrderByDescending(
                                appointment =>
                                    appointment.Status)
                            : query.OrderBy(
                                appointment =>
                                    appointment.Status),

                    "reason" =>
                        sortDirection?.ToLower() == "desc"
                            ? query.OrderByDescending(
                                appointment =>
                                    appointment.Reason)
                            : query.OrderBy(
                                appointment =>
                                    appointment.Reason),

                    _ =>
                        query.OrderBy(
                            appointment =>
                                appointment.AppointmentDate)
                };

            var items =
                await orderedQuery
                    .Skip(
                        (pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(appointment =>
                        new AppointmentResponseDto
                        {
                            Id =
                                appointment.Id,

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

            return (items, totalCount);
        }

        public async Task<bool>SoftDeleteAsync(Guid id)
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