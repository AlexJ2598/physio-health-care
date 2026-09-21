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
            var patientId = Guid.NewGuid();

            var patient =
                new Patient
                {
                    Id = patientId,
                    FirstName = "Alexis",
                    LastName = "Hernandez",
                    IsActive = true
                };

            var appointment =
                new Appointment
                {
                    Id = appointmentId,
                    PatientId = patientId,
                    Patient = patient,
                    AppointmentDate =
                        DateTime.UtcNow,
                    Reason = "Chequeo",
                    Notes = "Pruebas",
                    Status =
                        AppointmentStatus.Scheduled,
                    IsActive = true
                };

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
            result.Should().NotBeNull();

            result!.Id.Should()
                .Be(appointmentId);

            result.PatientId.Should()
                .Be(patientId);

            result.PatientName.Should()
                .Be("Alexis Hernandez");

            result.Reason.Should()
                .Be("Chequeo");

            result.Notes.Should()
                .Be("Pruebas");

            result.Status.Should()
                .Be(
                    AppointmentStatus
                        .Scheduled
                        .ToString());
        }

        [Fact]
        public async Task GetAllAsync_Test()
        {
            // Arrange
            var firstPatient =
                new Patient
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Alexis",
                    LastName = "Hernandez",
                    IsActive = true
                };

            var secondPatient =
                new Patient
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Test",
                    LastName = "User",
                    IsActive = true
                };

            var appointments =
                new List<Appointment>
                {
                    new Appointment
                    {
                        Id = Guid.NewGuid(),
                        PatientId =
                            firstPatient.Id,
                        Patient =
                            firstPatient,
                        AppointmentDate =
                            DateTime.UtcNow,
                        Reason = "Prueba",
                        Notes = "Prueba",
                        Status =
                            AppointmentStatus
                                .Scheduled,
                        IsActive = true
                    },

                    new Appointment
                    {
                        Id = Guid.NewGuid(),
                        PatientId =
                            secondPatient.Id,
                        Patient =
                            secondPatient,
                        AppointmentDate =
                            DateTime.UtcNow,
                        Reason = "Prueba",
                        Notes = "Prueba",
                        Status =
                            AppointmentStatus
                                .Scheduled,
                        IsActive = true
                    }
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
            result.Should().NotBeNull();

            result.Should()
                .HaveCount(2);

            result.Should()
                .Contain(appointment =>
                    appointment.PatientName
                    == "Alexis Hernandez");
        }

        [Fact]
        public async Task
            CreateAsync_WhenPatientExists_ShouldCreateAppointmentAndReturnResponseDto()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            var dto =
                new CreateAppointmentDto
                {
                    PatientId = patientId,
                    AppointmentDate =
                        DateTime.UtcNow,
                    Reason = "Test",
                    Notes = "Test"
                };

            var patient =
                new Patient
                {
                    Id = patientId,
                    FirstName = "Alexis",
                    LastName = "Hernandez",
                    IsActive = true
                };

            _patientRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(patientId))
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
                    new Appointment
                    {
                        Id = Guid.NewGuid(),
                        PatientId = patientId,
                        Patient = patient,
                        AppointmentDate =
                            dto.AppointmentDate,
                        Reason = dto.Reason,
                        Notes =
                            dto.Notes ?? string.Empty,
                        Status =
                            AppointmentStatus.Scheduled,
                        IsActive = true
                    });

            // Act
            var result =
                await _appointmentService
                    .CreateAsync(dto);

            // Assert
            result.Should().NotBeNull();

            result!.Reason.Should()
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
                            patientId),
                    Times.Once);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.CreateAsync(
                            It.Is<Appointment>(
                                appointment =>
                                    appointment.PatientId
                                        == patientId
                                    && appointment.Reason
                                        == "Test"
                                    && appointment.Notes
                                        == "Test"
                                    && appointment.Status
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
                        DateTime.UtcNow,
                    Reason = "Test",
                    Notes = "Test"
                };

            _patientRepositoryMock
                .Setup(repository =>
                    repository.GetByIdAsync(patientId))
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

            _patientRepositoryMock
                .Verify(
                    repository =>
                        repository.GetByIdAsync(
                            patientId),
                    Times.Once);

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
                        DateTime.UtcNow,
                    Reason =
                        "Update Test",
                    Notes =
                        "Update"
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
        }

        [Fact]
        public async Task
            UpdateStatusAsync_WhenTransitionIsValid_ShouldUpdateStatus()
        {
            // Arrange
            var appointmentId =
                Guid.NewGuid();

            var patient =
                new Patient
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Alexis",
                    LastName = "Hernandez",
                    IsActive = true
                };

            var appointment =
                new Appointment
                {
                    Id = appointmentId,
                    PatientId = patient.Id,
                    Patient = patient,
                    AppointmentDate =
                        DateTime.UtcNow.AddHours(1),
                    Reason = "Test",
                    Notes = "Test",
                    Status =
                        AppointmentStatus.Scheduled,
                    IsActive = true
                };

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
                    new Appointment
                    {
                        Id = appointmentId,
                        PatientId = patient.Id,
                        Patient = patient,
                        AppointmentDate =
                            appointment.AppointmentDate,
                        Reason =
                            appointment.Reason,
                        Notes =
                            appointment.Notes,
                        Status =
                            AppointmentStatus.InProgress,
                        IsActive = true
                    });

            // Act
            var result =
                await _appointmentService
                    .UpdateStatusAsync(
                        appointmentId,
                        dto);

            // Assert
            result.Should().NotBeNull();

            result!.Status.Should()
                .Be(
                    AppointmentStatus
                        .InProgress
                        .ToString());

            result.PatientName.Should()
                .Be("Alexis Hernandez");

            appointment.Status.Should()
                .Be(AppointmentStatus.InProgress);

            appointment.UpdatedAt.Should()
                .NotBeNull();

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.Is<Appointment>(
                                updatedAppointment =>
                                    updatedAppointment.Status
                                        == AppointmentStatus
                                            .InProgress)),
                    Times.Once);
        }

        [Fact]
        public async Task
            UpdateStatusAsync_WhenTransitionIsInvalid_ShouldThrowConflictException()
        {
            // Arrange
            var appointmentId =
                Guid.NewGuid();

            var appointment =
                new Appointment
                {
                    Id = appointmentId,
                    PatientId = Guid.NewGuid(),
                    AppointmentDate =
                        DateTime.UtcNow.AddHours(1),
                    Reason = "Test",
                    Notes = "Test",
                    Status =
                        AppointmentStatus.Scheduled,
                    IsActive = true
                };

            var dto =
                new UpdateAppointmentStatusDto
                {
                    Status =
                        AppointmentStatus.Completed
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
                    "Cannot change appointment status from Scheduled to Completed.");

            appointment.Status.Should()
                .Be(AppointmentStatus.Scheduled);

            _appointmentRepositoryMock
                .Verify(
                    repository =>
                        repository.UpdateAsync(
                            It.IsAny<Appointment>()),
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
    }
}