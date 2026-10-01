namespace PhysioHealthCare.Infrastructure.BackgroundServices
{
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.Interfaces;

    public class AppointmentExpirationBackgroundService
        : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AppointmentExpirationBackgroundService> _logger;

        public AppointmentExpirationBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<AppointmentExpirationBackgroundService> logger)
        {
            _scopeFactory = scopeFactory
                ?? throw new ArgumentNullException(
                    nameof(scopeFactory));

            _logger = logger
                ?? throw new ArgumentNullException(
                    nameof(logger));
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "Appointment expiration background service started.");

            await ProcessExpiredAppointmentsAsync(
                stoppingToken);

            using var timer =
                new PeriodicTimer(
                    TimeSpan.FromHours(1));

            try
            {
                while (await timer.WaitForNextTickAsync(
                           stoppingToken))
                {
                    await ProcessExpiredAppointmentsAsync(
                        stoppingToken);
                }
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                // Application is shutting down.
            }
        }

        private async Task ProcessExpiredAppointmentsAsync(
            CancellationToken stoppingToken)
        {
            try
            {
                using var scope =
                    _scopeFactory.CreateScope();

                var expirationService =
                    scope.ServiceProvider
                        .GetRequiredService<
                            IAppointmentExpirationService>();

                var cancelledCount =
                    await expirationService
                        .CancelExpiredAppointmentsAsync();

                if (cancelledCount > 0)
                {
                    _logger.LogInformation(
                        "Appointment expiration process cancelled {AppointmentCount} expired appointments.",
                        cancelledCount);
                }
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "An error occurred while processing expired appointments.");
            }
        }
    }
}