namespace PhysioHealthCare.Tests.Services
{
    using FluentAssertions;
    using Microsoft.Extensions.Logging;
    using Moq;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Application.Services;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;

    public class DashboardServiceTests
    {
        private readonly Mock<IDashboardRepository> _dashboardRepositoryMock;
        private readonly Mock<ILogger<DashboardService>> _loggerMock;
        private readonly DashboardService _dashboardService;

        public DashboardServiceTests()
        {
            _dashboardRepositoryMock =
                new Mock<IDashboardRepository>();

            _loggerMock =
                new Mock<ILogger<DashboardService>>();

            _dashboardService =
                new DashboardService(
                    _dashboardRepositoryMock.Object,
                    _loggerMock.Object);
        }

        [Fact]
        public async Task GetDashboardSummaryAsync_ShouldReturnSummary_WhenDataExists()
        {
            // Arrange
            var dateFrom =
                new DateTime(
                    2026,
                    9,
                    29,
                    6,
                    0,
                    0,
                    DateTimeKind.Utc);

            var dateTo =
                new DateTime(
                    2026,
                    9,
                    30,
                    5,
                    59,
                    59,
                    DateTimeKind.Utc);

            var currentDateTime =
                new DateTime(
                    2026,
                    9,
                    30,
                    1,
                    0,
                    0,
                    DateTimeKind.Utc);

            var patient = new Patient
            {
                Id = Guid.NewGuid(),
                FirstName = "Alexis",
                LastName = "Hernandez"
            };

            var nextAppointment = new Appointment
            {
                Id = Guid.NewGuid(),
                PatientId = patient.Id,
                Patient = patient,
                AppointmentDate =
                    currentDateTime.AddHours(1),
                Reason = "Follow-up",
                Status = AppointmentStatus.Scheduled
            };

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        null))
                .ReturnsAsync(2);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.Scheduled))
                .ReturnsAsync(1);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.InProgress))
                .ReturnsAsync(0);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.Completed))
                .ReturnsAsync(1);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsBeforeAsync(
                        dateFrom,
                        AppointmentStatus.Completed))
                .ReturnsAsync(4);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsBeforeAsync(
                        dateFrom,
                        AppointmentStatus.Cancelled))
                .ReturnsAsync(5);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.GetNextScheduledAppointmentAsync(
                        currentDateTime,
                        dateTo))
                .ReturnsAsync(nextAppointment);

            // Act
            var result =
                await _dashboardService.GetDashboardSummaryAsync(
                    dateFrom,
                    dateTo,
                    currentDateTime);

            // Assert
            result.Should().NotBeNull();

            result.TodayAppointments.Should().Be(2);
            result.TodayScheduled.Should().Be(1);
            result.TodayInProgress.Should().Be(0);
            result.TodayCompleted.Should().Be(1);

            result.HistoricalCompleted.Should().Be(4);
            result.HistoricalCancelled.Should().Be(5);

            result.NextAppointment.Should().NotBeNull();

            result.NextAppointment!.Id
                .Should().Be(nextAppointment.Id);

            result.NextAppointment.PatientId
                .Should().Be(patient.Id);

            result.NextAppointment.PatientName
                .Should().Be("Alexis Hernandez");

            result.NextAppointment.AppointmentDate
                .Should().Be(nextAppointment.AppointmentDate);

            result.NextAppointment.Reason
                .Should().Be("Follow-up");

            result.NextAppointment.Status
                .Should().Be(AppointmentStatus.Scheduled);
        }
        [Fact]
        public async Task GetDashboardSummaryAsync_ShouldReturnNullNextAppointment_WhenNoScheduledAppointmentExists()
        {
            // Arrange
            var dateFrom =
                new DateTime(
                    2026,
                    9,
                    29,
                    6,
                    0,
                    0,
                    DateTimeKind.Utc);

            var dateTo =
                new DateTime(
                    2026,
                    9,
                    30,
                    5,
                    59,
                    59,
                    DateTimeKind.Utc);

            var currentDateTime =
                new DateTime(
                    2026,
                    9,
                    30,
                    1,
                    0,
                    0,
                    DateTimeKind.Utc);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        null))
                .ReturnsAsync(1);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.Scheduled))
                .ReturnsAsync(0);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.InProgress))
                .ReturnsAsync(0);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.Completed))
                .ReturnsAsync(1);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsBeforeAsync(
                        dateFrom,
                        AppointmentStatus.Completed))
                .ReturnsAsync(4);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsBeforeAsync(
                        dateFrom,
                        AppointmentStatus.Cancelled))
                .ReturnsAsync(5);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.GetNextScheduledAppointmentAsync(
                        currentDateTime,
                        dateTo))
                .ReturnsAsync((Appointment?)null);

            // Act
            var result =
                await _dashboardService.GetDashboardSummaryAsync(
                    dateFrom,
                    dateTo,
                    currentDateTime);

            // Assert
            result.Should().NotBeNull();

            result.TodayAppointments.Should().Be(1);
            result.TodayScheduled.Should().Be(0);
            result.TodayInProgress.Should().Be(0);
            result.TodayCompleted.Should().Be(1);

            result.HistoricalCompleted.Should().Be(4);
            result.HistoricalCancelled.Should().Be(5);

            result.NextAppointment.Should().BeNull();
        }
        [Fact]
        public async Task GetDashboardSummaryAsync_ShouldCallRepositoryWithExpectedParameters()
        {
            // Arrange
            var dateFrom =
                new DateTime(
                    2026,
                    9,
                    29,
                    6,
                    0,
                    0,
                    DateTimeKind.Utc);

            var dateTo =
                new DateTime(
                    2026,
                    9,
                    30,
                    5,
                    59,
                    59,
                    DateTimeKind.Utc);

            var currentDateTime =
                new DateTime(
                    2026,
                    9,
                    30,
                    1,
                    0,
                    0,
                    DateTimeKind.Utc);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsAsync(
                        It.IsAny<DateTime>(),
                        It.IsAny<DateTime>(),
                        It.IsAny<AppointmentStatus?>()))
                .ReturnsAsync(0);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.CountAppointmentsBeforeAsync(
                        It.IsAny<DateTime>(),
                        It.IsAny<AppointmentStatus>()))
                .ReturnsAsync(0);

            _dashboardRepositoryMock
                .Setup(repository =>
                    repository.GetNextScheduledAppointmentAsync(
                        It.IsAny<DateTime>(),
                        It.IsAny<DateTime>()))
                .ReturnsAsync((Appointment?)null);

            // Act
            await _dashboardService.GetDashboardSummaryAsync(
                dateFrom,
                dateTo,
                currentDateTime);

            // Assert
            _dashboardRepositoryMock.Verify(
                repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        null),
                Times.Once);

            _dashboardRepositoryMock.Verify(
                repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.Scheduled),
                Times.Once);

            _dashboardRepositoryMock.Verify(
                repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.InProgress),
                Times.Once);

            _dashboardRepositoryMock.Verify(
                repository =>
                    repository.CountAppointmentsAsync(
                        dateFrom,
                        dateTo,
                        AppointmentStatus.Completed),
                Times.Once);

            _dashboardRepositoryMock.Verify(
                repository =>
                    repository.CountAppointmentsBeforeAsync(
                        dateFrom,
                        AppointmentStatus.Completed),
                Times.Once);

            _dashboardRepositoryMock.Verify(
                repository =>
                    repository.CountAppointmentsBeforeAsync(
                        dateFrom,
                        AppointmentStatus.Cancelled),
                Times.Once);

            _dashboardRepositoryMock.Verify(
                repository =>
                    repository.GetNextScheduledAppointmentAsync(
                        currentDateTime,
                        dateTo),
                Times.Once);

            _dashboardRepositoryMock.VerifyNoOtherCalls();
        }
    }
}