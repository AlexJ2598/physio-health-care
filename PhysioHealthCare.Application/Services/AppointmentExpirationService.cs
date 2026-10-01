namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Enums;

    public class AppointmentExpirationService
        : IAppointmentExpirationService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IClinicClock _clinicClock;
        private readonly ILogger<AppointmentExpirationService> _logger;

        public AppointmentExpirationService(
            IAppointmentRepository appointmentRepository,
            IClinicClock clinicClock,
            ILogger<AppointmentExpirationService> logger)
        {
            _appointmentRepository = appointmentRepository
                ?? throw new ArgumentNullException(
                    nameof(appointmentRepository));

            _clinicClock = clinicClock
                ?? throw new ArgumentNullException(
                    nameof(clinicClock));

            _logger = logger
                ?? throw new ArgumentNullException(
                    nameof(logger));
        }

        public async Task<int> CancelExpiredAppointmentsAsync()
        {
            var utcNow = _clinicClock.UtcNow;

            var today = _clinicClock.Today;

            var startOfTodayLocal = new DateTime(
                today.Year,
                today.Month,
                today.Day,
                0,
                0,
                0,
                DateTimeKind.Unspecified);

            var startOfTodayUtc =
                _clinicClock.ConvertLocalToUtc(
                    startOfTodayLocal);

            var expiredAppointments =
                await _appointmentRepository
                    .GetPendingBeforeAsync(
                        startOfTodayUtc);

            if (expiredAppointments.Count == 0)
            {
                return 0;
            }

            foreach (var appointment in expiredAppointments)
            {
                appointment.Status =
                    AppointmentStatus.Cancelled;

                appointment.CancelledAt =
                    utcNow;

                appointment.WasAutomaticallyCancelled =
                    true;

                appointment.UpdatedAt =
                    utcNow;

                await _appointmentRepository
                    .UpdateAsync(appointment);
            }

            _logger.LogInformation(
                "Automatically cancelled {AppointmentCount} expired appointments before {StartOfTodayUtc}.",
                expiredAppointments.Count,
                startOfTodayUtc);

            return expiredAppointments.Count;
        }
    }
}