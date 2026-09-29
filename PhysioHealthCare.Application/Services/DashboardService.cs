namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.DTOs.Dashboard;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Enums;

    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            IDashboardRepository dashboardRepository,
            ILogger<DashboardService> logger)
        {
            _dashboardRepository = dashboardRepository
                ?? throw new ArgumentNullException(
                    nameof(dashboardRepository));

            _logger = logger
                ?? throw new ArgumentNullException(
                    nameof(logger));
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(
            DateTime dateFrom,
            DateTime dateTo,
            DateTime currentDateTime)
        {
            _logger.LogInformation(
                "Getting dashboard summary. DateFrom: {DateFrom}, DateTo: {DateTo}, CurrentDateTime: {CurrentDateTime}",
                dateFrom,
                dateTo,
                currentDateTime);

            var todayAppointments =
                await _dashboardRepository.CountAppointmentsAsync(
                    dateFrom,
                    dateTo);

            var todayScheduled =
                await _dashboardRepository.CountAppointmentsAsync(
                    dateFrom,
                    dateTo,
                    AppointmentStatus.Scheduled);

            var todayInProgress =
                await _dashboardRepository.CountAppointmentsAsync(
                    dateFrom,
                    dateTo,
                    AppointmentStatus.InProgress);

            var todayCompleted =
                await _dashboardRepository.CountAppointmentsAsync(
                    dateFrom,
                    dateTo,
                    AppointmentStatus.Completed);

            var historicalCompleted =
                await _dashboardRepository.CountAppointmentsBeforeAsync(
                    dateFrom,
                    AppointmentStatus.Completed);

            var historicalCancelled =
                await _dashboardRepository.CountAppointmentsBeforeAsync(
                    dateFrom,
                    AppointmentStatus.Cancelled);

            var nextAppointment =
                await _dashboardRepository
                    .GetNextScheduledAppointmentAsync(
                        currentDateTime,
                        dateTo);

            var result = new DashboardSummaryDto
            {
                TodayAppointments = todayAppointments,
                TodayScheduled = todayScheduled,
                TodayInProgress = todayInProgress,
                TodayCompleted = todayCompleted,
                HistoricalCompleted = historicalCompleted,
                HistoricalCancelled = historicalCancelled,

                NextAppointment = nextAppointment == null
                    ? null
                    : new UpcomingAppointmentDto
                    {
                        Id = nextAppointment.Id,
                        PatientId = nextAppointment.PatientId,
                        PatientName =
                            $"{nextAppointment.Patient.FirstName} " +
                            $"{nextAppointment.Patient.LastName}",
                        AppointmentDate =
                            nextAppointment.AppointmentDate,
                        Reason =
                            nextAppointment.Reason,
                        Status =
                            nextAppointment.Status
                    }
            };

            _logger.LogInformation(
                "Dashboard summary retrieved successfully. TodayAppointments: {TodayAppointments}, TodayScheduled: {TodayScheduled}, TodayInProgress: {TodayInProgress}, TodayCompleted: {TodayCompleted}, HistoricalCompleted: {HistoricalCompleted}, HistoricalCancelled: {HistoricalCancelled}, HasNextAppointment: {HasNextAppointment}",
                result.TodayAppointments,
                result.TodayScheduled,
                result.TodayInProgress,
                result.TodayCompleted,
                result.HistoricalCompleted,
                result.HistoricalCancelled,
                result.NextAppointment != null);

            return result;
        }
    }
}