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

        private readonly AppointmentService
            _appointmentService;

        public AppointmentServiceTests()
        {
            _appointmentRepositoryMock =
                new Mock<IAppointmentRepository>();

            _patientRepositoryMock =
                new Mock<IPatientRepository>();

            _loggerMock =
                new Mock<ILogger<AppointmentService>>();

            _appointmentService =
                new AppointmentService(
                    _appointmentRepositoryMock.Object,
                    _patientRepositoryMock.Object,
                    _loggerMock.Object);
        }

        [Fact]
        public async Task
            GetByIdAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var appointmentId = Guid.NewGuid();

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        appointmentId))
                .ReturnsAsync(
                    (Appointment?)null);

            // Act
            var act = async () =>
                await _appointmentService
                    .GetByIdAsync(appointmentId);

            // Assert
            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage(
                    "Appointment not found.");
        }

        [Fact]
        public async Task
            GetByIdAsync_WhenAppointmentExists_ShouldReturnAppointmentResponseDto()
        {
            // Arrange
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

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        appointmentId))
                .ReturnsAsync(appointment);

            // Act
            var result =
                await _appointmentService
                    .GetByIdAsync(appointmentId);

            // Assert
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
        }

        [Fact]
        public async Task
            GetAllAsync_WhenAppointmentsExist_ShouldReturnMappedAppointments()
        {
            // Arrange
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

            // Act
            var result =
                await _appointmentService
                    .GetAllAsync();

            // Assert
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
            // Arrange
            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.GetAllAsync())
                .ReturnsAsync(
                    new List<Appointment>());

            // Act
            var result =
                await _appointmentService
                    .GetAllAsync();

            // Assert
            result.Should()
                .NotBeNull();

            result.Should()
                .BeEmpty();
        }

        [Fact]
        public async Task
            GetPagedAsync_WhenAppointmentsExist_ShouldReturnMappedPagedResult()
        {
            // Arrange
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

            // Act
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

            // Assert
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
            // Arrange
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

            // Act
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

            // Assert
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
            // Arrange
            var patient =
                CreatePatient(
                    "Alexis",
                    "Hernandez");

            var dto =
                new CreateAppointmentDto
                {
                    PatientId = patient.Id,
                    AppointmentDate =
                        DateTime.UtcNow.AddHours(1),
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
                                dto.AppointmentDate,
                            Reason = dto.Reason,
                            Notes =
                                dto.Notes
                                ?? string.Empty,
                            Status =
                                AppointmentStatus.Scheduled,
                            IsActive = true
                        });

            // Act
            var result =
                await _appointmentService
                    .CreateAsync(dto);

            // Assert
            result.Reason.Should()
                .Be("Test");

            result.Notes.Should()
                .Be("Test");

            result.PatientName.Should()
                .Be("Alexis Hernandez");

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .Scheduled
                        .ToString());

            _patientRepositoryMock
                .Verify(
                    repository =>
                        repository.GetByIdAsync(
                            patient.Id),
                    Times.Once);

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
                                        == "Test" &&
                                    appointment.Status
                                        == AppointmentStatus
                                            .Scheduled)),
                    Times.Once);
        }

        [Fact]
        public async Task
            CreateAsync_WhenPatientDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            var dto =
                new CreateAppointmentDto
                {
                    PatientId = patientId,
                    AppointmentDate =
                        DateTime.UtcNow.AddHours(1),
                    Reason = "Test",
                    Notes = "Test"
                };

            _patientRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(
                        patientId))
                .ReturnsAsync(
                    (Patient?)null);

            // Act
            var act = async () =>
                await _appointmentService
                    .CreateAsync(dto);

            // Assert
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
            UpdateAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var appointmentId =
                Guid.NewGuid();

            var dto =
                new UpdateAppointmentDto
                {
                    AppointmentDate =
                        DateTime.UtcNow.AddHours(1),
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

            // Act
            var act = async () =>
                await _appointmentService
                    .UpdateAsync(
                        appointmentId,
                        dto);

            // Assert
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
            UpdateAsync_WhenAppointmentExists_ShouldUpdateAppointmentAndReturnResponseDto()
        {
            // Arrange
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
                DateTime.UtcNow.AddDays(1);

            var dto =
                new UpdateAppointmentDto
                {
                    AppointmentDate = newDate,
                    Reason = "Updated reason",
                    Notes = "Updated notes"
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
                    () =>
                        new Appointment
                        {
                            Id = appointment.Id,
                            PatientId =
                                appointment.PatientId,
                            Patient = patient,
                            AppointmentDate =
                                appointment.AppointmentDate,
                            Reason =
                                appointment.Reason,
                            Notes =
                                appointment.Notes,
                            Status =
                                appointment.Status,
                            IsActive =
                                appointment.IsActive
                        });

            // Act
            var result =
                await _appointmentService
                    .UpdateAsync(
                        appointmentId,
                        dto);

            // Assert
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
                .NotBeNull();

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.Is<Appointment>(
                                updatedAppointment =>
                                    updatedAppointment.Id
                                        == appointmentId &&
                                    updatedAppointment.Reason
                                        == "Updated reason" &&
                                    updatedAppointment.Notes
                                        == "Updated notes")),
                    Times.Once);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.GetByIdAsync(
                            appointmentId),
                    Times.Once);
        }

        [Theory]
        [InlineData(
            AppointmentStatus.Scheduled,
            AppointmentStatus.InProgress)]
        [InlineData(
            AppointmentStatus.Scheduled,
            AppointmentStatus.Cancelled)]
        [InlineData(
            AppointmentStatus.InProgress,
            AppointmentStatus.Completed)]
        [InlineData(
            AppointmentStatus.InProgress,
            AppointmentStatus.Cancelled)]
        public async Task
            UpdateStatusAsync_WhenTransitionIsValid_ShouldUpdateStatus(
                AppointmentStatus currentStatus,
                AppointmentStatus newStatus)
        {
            // Arrange
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
                    () =>
                        new Appointment
                        {
                            Id = appointment.Id,
                            PatientId =
                                appointment.PatientId,
                            Patient = patient,
                            AppointmentDate =
                                appointment.AppointmentDate,
                            Reason =
                                appointment.Reason,
                            Notes =
                                appointment.Notes,
                            Status =
                                appointment.Status,
                            IsActive =
                                appointment.IsActive
                        });

            // Act
            var result =
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            // Assert
            result.Status.Should()
                .Be(newStatus.ToString());

            result.PatientName.Should()
                .Be("Alexis Hernandez");

            appointment.Status.Should()
                .Be(newStatus);

            appointment.UpdatedAt.Should()
                .NotBeNull();

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.Is<Appointment>(
                                updatedAppointment =>
                                    updatedAppointment.Status
                                        == newStatus)),
                    Times.Once);
        }

        [Theory]
        [InlineData(AppointmentStatus.Scheduled)]
        [InlineData(AppointmentStatus.InProgress)]
        [InlineData(AppointmentStatus.Completed)]
        [InlineData(AppointmentStatus.Cancelled)]
        public async Task
            UpdateStatusAsync_WhenStatusDoesNotChange_ShouldSucceed(
                AppointmentStatus status)
        {
            // Arrange
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
                    () =>
                        new Appointment
                        {
                            Id = appointment.Id,
                            PatientId =
                                appointment.PatientId,
                            Patient = patient,
                            AppointmentDate =
                                appointment.AppointmentDate,
                            Reason =
                                appointment.Reason,
                            Notes =
                                appointment.Notes,
                            Status =
                                appointment.Status,
                            IsActive =
                                appointment.IsActive
                        });

            // Act
            var result =
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            // Assert
            result.Status.Should()
                .Be(status.ToString());

            appointment.Status.Should()
                .Be(status);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
                    Times.Once);
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
            // Arrange
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

            // Act
            var act = async () =>
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            // Assert
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

        [Fact]
        public async Task
            UpdateStatusAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
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

            // Act
            var act = async () =>
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            // Assert
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
            SoftDeleteAsync_WhenAppointmentExists_ShouldDeleteAppointment()
        {
            // Arrange
            var appointmentId =
                Guid.NewGuid();

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.SoftDeleteAsync(
                        appointmentId))
                .ReturnsAsync(true);

            // Act
            await _appointmentService
                .SoftDeleteAsync(appointmentId);

            // Assert
            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.SoftDeleteAsync(
                            appointmentId),
                    Times.Once);
        }

        [Fact]
        public async Task
            SoftDeleteAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var appointmentId =
                Guid.NewGuid();

            _appointmentRepositoryMock
                .Setup(repository =>
                    repository.SoftDeleteAsync(
                        appointmentId))
                .ReturnsAsync(false);

            // Act
            var act = async () =>
                await _appointmentService
                    .SoftDeleteAsync(
                        appointmentId);

            // Assert
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

        private static Appointment CreateAppointment(
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
                    DateTime.UtcNow.AddHours(1),
                Reason = "Test reason",
                Notes = "Test notes",
                Status = status,
                IsActive = true
            };
        }
    }
}