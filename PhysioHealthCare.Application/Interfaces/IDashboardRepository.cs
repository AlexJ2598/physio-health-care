namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;
    public interface IDashboardRepository
    {
        Task<int> CountAppointmentsAsync(
            DateTime dateFrom,
            DateTime dateTo,
            AppointmentStatus? status = null);
        Task<int> CountAppointmentsBeforeAsync(
            DateTime before,
            AppointmentStatus status);
        Task<Appointment?> GetCurrentAppointmentAsync(DateTime dateFrom, DateTime dateTo);

        Task<Appointment?> GetNextScheduledAppointmentAsync(DateTime from,
            DateTime to);
    }
}
