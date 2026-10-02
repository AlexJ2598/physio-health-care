namespace PhysioHealthCare.Tests.Services
{
    using FluentAssertions;
    using Microsoft.Extensions.Logging;
    using Moq;
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Application.Services;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;

    public class AppointmentServiceTests
    {
        private readonly Mock<IAppointmentRepository>
            _appointmentRepositoryMock;

        private readonly Mock<IPatientRepository>
            _patientRepositoryMock;

        private readonly Mock<ILogger<AppointmentService>>
            _loggerMock;

        private readonly Mock<IClinicClock>
            _clinicClockMock;

        private readonly AppointmentService
            _appointmentService;

        private readonly DateTime
            _utcNow = new(2026, 10, 2, 18, 0, 0, DateTimeKind.Utc);

        private readonly DateOnly
            _today = new(2026, 10, 2);

        private readonly DateTime
            _startOfTodayUtc = new(2026, 10, 2, 6, 0, 0, DateTimeKind.Utc);

        public AppointmentServiceTests()
        {
            _appointmentRepositoryMock =
                new Mock<IAppointmentRepository>();

            _patientRepositoryMock =
                new Mock<IPatientRepository>();

            _loggerMock =
                new Mock<ILogger<AppointmentService>>();

            _clinicClockMock =
                new Mock<IClinicClock>();

            _clinicClockMock
                .Setup(clock => clock.UtcNow)
                .Returns(_utcNow);

            _clinicClockMock
                .Setup(clock => clock.Today)
                .Returns(_today);

            _clinicClockMock
                .Setup(clock =>
                    clock.ConvertLocalToUtc(
                        It.IsAny<DateTime>()))
                .Returns(_startOfTodayUtc);

            _appointmentService =
                new AppointmentService(
                    _appointmentRepositoryMock.Object,
                    _patientRepositoryMock.Object,
                    _loggerMock.Object,
                    _clinicClockMock.Object);
        }

        [Fact]
        public async Task
            GetByIdAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            var appointmentId = Guid.NewGuid();

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        appointmentId))
                .ReturnsAsync(
                    (Appointment?)null);

            var act = async () =>
                await _appointmentService
                    .GetByIdAsync(appointmentId);

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage(
                    "Appointment not found.");
        }

        [Fact]
        public async Task
            GetByIdAsync_WhenAppointmentExists_ShouldReturnAppointmentResponseDto()
        {
            var appointmentId = Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    AppointmentStatus.Scheduled);

            appointment.StartedAt =
                _utcNow.AddMinutes(-30);

            appointment.CompletedAt =
                _utcNow.AddMinutes(-10);

            appointment.CancelledAt =
                _utcNow.AddMinutes(-5);

            appointment.WasAutomaticallyCancelled =
                true;

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            var result =
                await _appointmentService
                    .GetByIdAsync(appointmentId);

            result.Id.Should()
                .Be(appointmentId);

            result.PatientId.Should()
                .Be(patient.Id);

            result.PatientName.Should()
                .Be("Alexis Hernandez");

            result.Reason.Should()
                .Be("Test reason");

            result.Notes.Should()
                .Be("Test notes");

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .Scheduled
                        .ToString());

            result.StartedAt.Should()
                .Be(appointment.StartedAt);

            result.CompletedAt.Should()
                .Be(appointment.CompletedAt);

            result.CancelledAt.Should()
                .Be(appointment.CancelledAt);

            result.WasAutomaticallyCancelled.Should()
                .BeTrue();
        }

        [Fact]
        public async Task
            GetAllAsync_WhenAppointmentsExist_ShouldReturnMappedAppointments()
        {
            var firstPatient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var secondPatient =
                CreatePatient(
                    "Test",
                    "User");

            var appointments =
                new List<Appointment>
                {
                    CreateAppointment(
                        Guid.NewGuid(),
                        firstPatient,
                        AppointmentStatus.Scheduled),

                    CreateAppointment(
                        Guid.NewGuid(),
                        secondPatient,
                        AppointmentStatus.Completed)
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetAllAsync())
                .ReturnsAsync(appointments);

            var result =
                await _appointmentService
                    .GetAllAsync();

            result.Should()
                .HaveCount(2);

            result.Should()
                .Contain(appointment =>
                    appointment.PatientName
                        == "Alexis Hernandez");

            result.Should()
                .Contain(appointment =>
                    appointment.PatientName
                        == "Test User");

            result.Should()
                .Contain(appointment =>
                    appointment.Status
                        == AppointmentStatus
                            .Completed
                            .ToString());
        }

        [Fact]
        public async Task
            GetAllAsync_WhenNoAppointmentsExist_ShouldReturnEmptyCollection()
        {
            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetAllAsync())
                .ReturnsAsync(
                    new List<Appointment>());

            var result =
                await _appointmentService
                    .GetAllAsync();

            result.Should()
                .NotBeNull();

            result.Should()
                .BeEmpty();
        }

        [Fact]
        public async Task
            GetPagedAsync_WhenAppointmentsExist_ShouldReturnMappedPagedResult()
        {
            const int pageNumber = 2;
            const int pageSize = 5;

            var patientId = Guid.NewGuid();

            var patient =
                new Patient
                {
                    Id = patientId,
                    FirstName = "Alexis",
                    LastName = "Hernandez",
                    IsActive = true
                };

            var appointments =
                new List<Appointment>
                {
                    CreateAppointment(
                        Guid.NewGuid(),
                        patient,
                        AppointmentStatus.Scheduled),

                    CreateAppointment(
                        Guid.NewGuid(),
                        patient,
                        AppointmentStatus.InProgress)
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetPagedAsync(
                        pageNumber,
                        pageSize,
                        patientId,
                        AppointmentStatus.Scheduled,
                        null,
                        null,
                        "test",
                        "appointmentDate",
                        "desc"))
                .ReturnsAsync(
                    (appointments, 12));

            var result =
                await _appointmentService
                    .GetPagedAsync(
                        pageNumber,
                        pageSize,
                        patientId,
                        AppointmentStatus.Scheduled,
                        null,
                        null,
                        "test",
                        "appointmentDate",
                        "desc");

            result.PageNumber.Should()
                .Be(pageNumber);

            result.PageSize.Should()
                .Be(pageSize);

            result.TotalCount.Should()
                .Be(12);

            result.TotalPages.Should()
                .Be(3);

            result.Items.Should()
                .HaveCount(2);

            result.Items.Should()
                .OnlyContain(
                    appointment =>
                        appointment.PatientName
                            == "Alexis Hernandez");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.GetPagedAsync(
                            pageNumber,
                            pageSize,
                            patientId,
                            AppointmentStatus.Scheduled,
                            null,
                            null,
                            "test",
                            "appointmentDate",
                            "desc"),
                    Times.Once);
        }

        [Fact]
        public async Task
            GetPagedAsync_WhenNoAppointmentsExist_ShouldReturnEmptyPagedResult()
        {
            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetPagedAsync(
                        1,
                        10,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        "asc"))
                .ReturnsAsync(
                    (new List<Appointment>(), 0));

            var result =
                await _appointmentService
                    .GetPagedAsync(
                        1,
                        10,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        "asc");

            result.Items.Should()
                .BeEmpty();

            result.TotalCount.Should()
                .Be(0);

            result.TotalPages.Should()
                .Be(0);

            result.PageNumber.Should()
                .Be(1);

            result.PageSize.Should()
                .Be(10);
        }

        [Fact]
        public async Task
            CreateAsync_WhenPatientExists_ShouldCreateAppointmentAndReturnResponseDto()
        {
            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var dto =
                new CreateAppointmentDto
                {
                    PatientId = patient.Id,
                    AppointmentDate =
                        _startOfTodayUtc.AddHours(10),
                    Reason = "  Test  ",
                    Notes = "  Test notes  "
                };

            _patientRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        patient.Id))
                .ReturnsAsync(patient);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.CreateAsync(
                        It.IsAny<Appointment>()))
                .ReturnsAsync(
                    (Appointment appointment) =>
                        appointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        It.IsAny<Guid>()))
                .ReturnsAsync(
                    (Guid id) =>
                        new Appointment
                        {
                            Id = id,
                            PatientId = patient.Id,
                            Patient = patient,
                            AppointmentDate =
                                dto.AppointmentDate,
                            Reason = "Test",
                            Notes = "Test notes",
                            Status =
                                AppointmentStatus.Scheduled,
                            CreatedAt = _utcNow,
                            IsActive = true
                        });

            var result =
                await _appointmentService
                    .CreateAsync(dto);

            result.Reason.Should()
                .Be("Test");

            result.Notes.Should()
                .Be("Test notes");

            result.PatientName.Should()
                .Be("Alexis Hernandez");

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .Scheduled
                        .ToString());

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.CreateAsync(
                            It.Is<Appointment>(
                                appointment =>
                                    appointment.PatientId
                                        == patient.Id &&
                                    appointment.Reason
                                        == "Test" &&
                                    appointment.Notes
                                        == "Test notes" &&
                                    appointment.Status
                                        == AppointmentStatus.Scheduled &&
                                    appointment.CreatedAt
                                        == _utcNow &&
                                    appointment.IsActive)),
                    Times.Once);
        }

        [Fact]
        public async Task
            CreateAsync_WhenPatientDoesNotExist_ShouldThrowNotFoundException()
        {
            var patientId = Guid.NewGuid();

            var dto =
                new CreateAppointmentDto
                {
                    PatientId = patientId,
                    AppointmentDate =
                        _startOfTodayUtc.AddHours(10),
                    Reason = "Test",
                    Notes = "Test"
                };

            _patientRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        patientId))
                .ReturnsAsync(
                    (Patient?)null);

            var act = async () =>
                await _appointmentService
                    .CreateAsync(dto);

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage(
                    "Patient not found.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.CreateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            CreateAsync_WhenAppointmentIsFromPastClinicDay_ShouldThrowConflictException()
        {
            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var dto =
                new CreateAppointmentDto
                {
                    PatientId = patient.Id,
                    AppointmentDate =
                        _startOfTodayUtc.AddTicks(-1),
                    Reason = "Test",
                    Notes = "Test"
                };

            _patientRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        patient.Id))
                .ReturnsAsync(patient);

            var act = async () =>
                await _appointmentService
                    .CreateAsync(dto);

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage(
                    "Cannot create an appointment for a past date.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.CreateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            CreateAsync_WhenAppointmentIsEarlierToday_ShouldAllowCreation()
        {
            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointmentDate =
                _startOfTodayUtc.AddHours(1);

            var dto =
                new CreateAppointmentDto
                {
                    PatientId = patient.Id,
                    AppointmentDate =
                        appointmentDate,
                    Reason = "Test",
                    Notes = "Test"
                };

            _patientRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        patient.Id))
                .ReturnsAsync(patient);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.CreateAsync(
                        It.IsAny<Appointment>()))
                .ReturnsAsync(
                    (Appointment appointment) =>
                        appointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        It.IsAny<Guid>()))
                .ReturnsAsync(
                    (Guid id) =>
                        new Appointment
                        {
                            Id = id,
                            PatientId = patient.Id,
                            Patient = patient,
                            AppointmentDate =
                                appointmentDate,
                            Reason = "Test",
                            Notes = "Test",
                            Status =
                                AppointmentStatus.Scheduled,
                            CreatedAt = _utcNow,
                            IsActive = true
                        });

            var result =
                await _appointmentService
                    .CreateAsync(dto);

            result.AppointmentDate.Should()
                .Be(appointmentDate);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.CreateAsync(
                            It.IsAny<Appointment>()),
                    Times.Once);
        }

        [Fact]
        public async Task
            UpdateAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            var appointmentId =
                Guid.NewGuid();

            var dto =
                new UpdateAppointmentDto
                {
                    AppointmentDate =
                        _startOfTodayUtc.AddHours(10),
                    Reason = "Updated reason",
                    Notes = "Updated notes"
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository
                        .GetByIdForUpdateAsync(
                            appointmentId))
                .ReturnsAsync(
                    (Appointment?)null);

            var act = async () =>
                await _appointmentService
                    .UpdateAsync(
                        appointmentId,
                        dto);

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage(
                    "Appointment not found.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            UpdateAsync_WhenScheduled_ShouldUpdateAppointmentAndReturnResponseDto()
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    AppointmentStatus.Scheduled);

            var newDate =
                _startOfTodayUtc.AddDays(1);

            var dto =
                new UpdateAppointmentDto
                {
                    AppointmentDate = newDate,
                    Reason = "  Updated reason  ",
                    Notes = "  Updated notes  "
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.UpdateAsync(
                        It.IsAny<Appointment>()))
                .ReturnsAsync(
                    (Appointment updatedAppointment) =>
                        updatedAppointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        appointmentId))
                .ReturnsAsync(
                    () => appointment);

            var result =
                await _appointmentService
                    .UpdateAsync(
                        appointmentId,
                        dto);

            result.AppointmentDate.Should()
                .Be(newDate);

            result.Reason.Should()
                .Be("Updated reason");

            result.Notes.Should()
                .Be("Updated notes");

            result.PatientName.Should()
                .Be("Alexis Hernandez");

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .Scheduled
                        .ToString());

            appointment.AppointmentDate.Should()
                .Be(newDate);

            appointment.Reason.Should()
                .Be("Updated reason");

            appointment.Notes.Should()
                .Be("Updated notes");

            appointment.UpdatedAt.Should()
                .Be(_utcNow);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            appointment),
                    Times.Once);
        }

        [Theory]
        [InlineData(AppointmentStatus.InProgress)]
        [InlineData(AppointmentStatus.Completed)]
        [InlineData(AppointmentStatus.Cancelled)]
        public async Task
            UpdateAsync_WhenAppointmentIsNotScheduled_ShouldThrowConflictException(
                AppointmentStatus status)
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    status);

            var dto =
                new UpdateAppointmentDto
                {
                    AppointmentDate =
                        _startOfTodayUtc.AddDays(1),
                    Reason = "Updated reason",
                    Notes = "Updated notes"
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            var act = async () =>
                await _appointmentService
                    .UpdateAsync(
                        appointmentId,
                        dto);

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage(
                    $"Cannot edit an appointment with status {status}.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            UpdateAsync_WhenRescheduledToPastClinicDay_ShouldThrowConflictException()
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    AppointmentStatus.Scheduled);

            var dto =
                new UpdateAppointmentDto
                {
                    AppointmentDate =
                        _startOfTodayUtc.AddTicks(-1),
                    Reason = "Updated reason",
                    Notes = "Updated notes"
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            var act = async () =>
                await _appointmentService
                    .UpdateAsync(
                        appointmentId,
                        dto);

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage(
                    "Cannot reschedule an appointment to a past date.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            UpdateStatusAsync_WhenScheduledChangesToInProgress_ShouldSetStartedAt()
        {
            var appointment =
                await ArrangeStatusUpdateAsync(
                    AppointmentStatus.Scheduled);

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status =
                        AppointmentStatus.InProgress
                };

            var result =
                await _appointmentService
                    .UpdateStatusAsync(
                        appointment.Id,
                        dto);

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .InProgress
                        .ToString());

            result.StartedAt.Should()
                .Be(_utcNow);

            appointment.Status.Should()
                .Be(AppointmentStatus.InProgress);

            appointment.StartedAt.Should()
                .Be(_utcNow);

            appointment.CompletedAt.Should()
                .BeNull();

            appointment.CancelledAt.Should()
                .BeNull();

            appointment.UpdatedAt.Should()
                .Be(_utcNow);
        }

        [Fact]
        public async Task
            UpdateStatusAsync_WhenInProgressChangesToCompleted_ShouldSetCompletedAt()
        {
            var appointment =
                await ArrangeStatusUpdateAsync(
                    AppointmentStatus.InProgress);

            appointment.StartedAt =
                _utcNow.AddMinutes(-30);

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status =
                        AppointmentStatus.Completed
                };

            var result =
                await _appointmentService
                    .UpdateStatusAsync(
                        appointment.Id,
                        dto);

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .Completed
                        .ToString());

            result.StartedAt.Should()
                .Be(
                    _utcNow.AddMinutes(-30));

            result.CompletedAt.Should()
                .Be(_utcNow);

            appointment.Status.Should()
                .Be(AppointmentStatus.Completed);

            appointment.CompletedAt.Should()
                .Be(_utcNow);

            appointment.CancelledAt.Should()
                .BeNull();

            appointment.UpdatedAt.Should()
                .Be(_utcNow);
        }

        [Theory]
        [InlineData(AppointmentStatus.Scheduled)]
        [InlineData(AppointmentStatus.InProgress)]
        public async Task
            UpdateStatusAsync_WhenAppointmentIsManuallyCancelled_ShouldSetCancellationLifecycle(
                AppointmentStatus currentStatus)
        {
            var appointment =
                await ArrangeStatusUpdateAsync(
                    currentStatus);

            appointment.WasAutomaticallyCancelled =
                true;

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status =
                        AppointmentStatus.Cancelled
                };

            var result =
                await _appointmentService
                    .UpdateStatusAsync(
                        appointment.Id,
                        dto);

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .Cancelled
                        .ToString());

            result.CancelledAt.Should()
                .Be(_utcNow);

            result.WasAutomaticallyCancelled.Should()
                .BeFalse();

            appointment.Status.Should()
                .Be(AppointmentStatus.Cancelled);

            appointment.CancelledAt.Should()
                .Be(_utcNow);

            appointment.WasAutomaticallyCancelled.Should()
                .BeFalse();

            appointment.UpdatedAt.Should()
                .Be(_utcNow);
        }

        [Theory]
        [InlineData(
            AppointmentStatus.Scheduled,
            AppointmentStatus.Completed)]
        [InlineData(
            AppointmentStatus.InProgress,
            AppointmentStatus.Scheduled)]
        [InlineData(
            AppointmentStatus.Completed,
            AppointmentStatus.Scheduled)]
        [InlineData(
            AppointmentStatus.Completed,
            AppointmentStatus.InProgress)]
        [InlineData(
            AppointmentStatus.Completed,
            AppointmentStatus.Cancelled)]
        [InlineData(
            AppointmentStatus.Cancelled,
            AppointmentStatus.Scheduled)]
        [InlineData(
            AppointmentStatus.Cancelled,
            AppointmentStatus.InProgress)]
        [InlineData(
            AppointmentStatus.Cancelled,
            AppointmentStatus.Completed)]
        public async Task
            UpdateStatusAsync_WhenTransitionIsInvalid_ShouldThrowConflictException(
                AppointmentStatus currentStatus,
                AppointmentStatus newStatus)
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    currentStatus);

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status = newStatus
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            var act = async () =>
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage(
                    $"Cannot change appointment status from {currentStatus} to {newStatus}.");

            appointment.Status.Should()
                .Be(currentStatus);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.GetByIdAsync(
                            It.IsAny<Guid>()),
                    Times.Never);
        }

        [Theory]
        [InlineData(AppointmentStatus.Scheduled)]
        [InlineData(AppointmentStatus.InProgress)]
        [InlineData(AppointmentStatus.Completed)]
        [InlineData(AppointmentStatus.Cancelled)]
        public async Task
            UpdateStatusAsync_WhenStatusDoesNotChange_ShouldThrowConflictException(
                AppointmentStatus status)
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    status);

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status = status
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            var act = async () =>
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage(
                    $"Cannot change appointment status from {status} to {status}.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            UpdateStatusAsync_WhenStartingAppointmentFromPastClinicDay_ShouldThrowConflictException()
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    AppointmentStatus.Scheduled);

            appointment.AppointmentDate =
                _startOfTodayUtc.AddTicks(-1);

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status =
                        AppointmentStatus.InProgress
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            var act = async () =>
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage(
                    "Cannot start an appointment from a past date.");

            appointment.Status.Should()
                .Be(AppointmentStatus.Scheduled);

            appointment.StartedAt.Should()
                .BeNull();

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            UpdateStatusAsync_WhenStartingAppointmentEarlierToday_ShouldSucceed()
        {
            var appointment =
                await ArrangeStatusUpdateAsync(
                    AppointmentStatus.Scheduled);

            appointment.AppointmentDate =
                _startOfTodayUtc.AddHours(1);

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status =
                        AppointmentStatus.InProgress
                };

            var result =
                await _appointmentService
                    .UpdateStatusAsync(
                        appointment.Id,
                        dto);

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .InProgress
                        .ToString());

            result.StartedAt.Should()
                .Be(_utcNow);
        }

        [Fact]
        public async Task
            UpdateStatusAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            var appointmentId =
                Guid.NewGuid();

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status =
                        AppointmentStatus.InProgress
                };

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(
                    (Appointment?)null);

            var act = async () =>
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage(
                    "Appointment not found.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Never);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.GetByIdAsync(
                            It.IsAny<Guid>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            SoftDeleteAsync_WhenAppointmentIsScheduled_ShouldDeleteAppointment()
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    AppointmentStatus.Scheduled);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.SoftDeleteAsync(
                        appointmentId))
                .ReturnsAsync(true);

            await _appointmentService
                .SoftDeleteAsync(appointmentId);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.SoftDeleteAsync(
                            appointmentId),
                    Times.Once);
        }

        [Theory]
        [InlineData(AppointmentStatus.InProgress)]
        [InlineData(AppointmentStatus.Completed)]
        [InlineData(AppointmentStatus.Cancelled)]
        public async Task
            SoftDeleteAsync_WhenAppointmentIsNotScheduled_ShouldThrowConflictException(
                AppointmentStatus status)
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    status);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            var act = async () =>
                await _appointmentService
                    .SoftDeleteAsync(
                        appointmentId);

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage(
                    $"Cannot delete an appointment with status {status}.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.SoftDeleteAsync(
                            It.IsAny<Guid>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            SoftDeleteAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            var appointmentId =
                Guid.NewGuid();

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(
                    (Appointment?)null);

            var act = async () =>
                await _appointmentService
                    .SoftDeleteAsync(
                        appointmentId);

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage(
                    "Appointment not found.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.SoftDeleteAsync(
                            It.IsAny<Guid>()),
                    Times.Never);
        }

        [Fact]
        public async Task
            SoftDeleteAsync_WhenRepositoryCannotDelete_ShouldThrowNotFoundException()
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    AppointmentStatus.Scheduled);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.SoftDeleteAsync(
                        appointmentId))
                .ReturnsAsync(false);

            var act = async () =>
                await _appointmentService
                    .SoftDeleteAsync(
                        appointmentId);

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage(
                    "Appointment not found.");

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.SoftDeleteAsync(
                            appointmentId),
                    Times.Once);
        }

        private async Task<Appointment>
            ArrangeStatusUpdateAsync(
                AppointmentStatus currentStatus)
        {
            var appointmentId =
                Guid.NewGuid();

            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var appointment =
                CreateAppointment(
                    appointmentId,
                    patient,
                    currentStatus);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdForUpdateAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.UpdateAsync(
                        It.IsAny<Appointment>()))
                .ReturnsAsync(
                    (Appointment updatedAppointment) =>
                        updatedAppointment);

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        appointmentId))
                .ReturnsAsync(
                    () => appointment);

            await Task.CompletedTask;

            return appointment;
        }

        private static Patient CreatePatient(
            string firstName,
            string lastName)
        {
            return new Patient
            {
                Id = Guid.NewGuid(),
                FirstName = firstName,
                LastName = lastName,
                IsActive = true
            };
        }

        private Appointment CreateAppointment(
            Guid appointmentId,
            Patient patient,
            AppointmentStatus status)
        {
            return new Appointment
            {
                Id = appointmentId,
                PatientId = patient.Id,
                Patient = patient,
                AppointmentDate =
                    _startOfTodayUtc.AddHours(10),
                Reason = "Test reason",
                Notes = "Test notes",
                Status = status,
                IsActive = true
            };
        }
    }
}