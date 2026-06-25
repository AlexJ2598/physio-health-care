namespace PhysioHealthCare.Tests.Services
{
    using FluentAssertions;
    using Microsoft.Extensions.Logging;
    using Moq;
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.DTOs.Patients;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Application.Services;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;
    using PhysioHealthCare.Infrastructure.Repositories;
    public class AppointmentServiceTests
    {
        private readonly Mock<IAppointmentRepository> _appointmentRepositoryMock;
        private readonly Mock<ILogger<AppointmentService>> _loggerMock;
        private readonly AppointmentService _appointmentService;

        public AppointmentServiceTests()
        {
            _appointmentRepositoryMock = new Mock<IAppointmentRepository>();
            _loggerMock = new Mock<ILogger<AppointmentService>>();
            _appointmentService = new AppointmentService(_appointmentRepositoryMock.Object, _loggerMock.Object);
        }
        [Fact]
        public async Task GetByIdAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var appointmentId = Guid.NewGuid();

            _appointmentRepositoryMock
                .Setup(repo => repo.GetByIdAsync(appointmentId))
                .ReturnsAsync((AppointmentResponseDto?)null);

            // Act
            var act = async () => await _appointmentService.GetByIdAsync(appointmentId);

            // Assert
            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Appointment not found.");
        }
        [Fact]
        public async Task GetByIdAsync_WhenAppointmentExists_ShouldReturnAppointmentResponseDto()
        {
            // Arrange
            var appointmentId = Guid.NewGuid();
            var patientId = Guid.NewGuid();

            var appointment = new AppointmentResponseDto
            {
                Id = appointmentId,
                PatientId = patientId,
                PatientName = "Alexis Hernandez",
                AppointmentDate = DateTime.UtcNow,
                Reason = "Chequeo",
                Notes = "Pruebas",
                IsCompleted = false
            };

            _appointmentRepositoryMock
                .Setup(repo => repo.GetByIdAsync(appointmentId))
                .ReturnsAsync(appointment);

            // Act
            var result = await _appointmentService.GetByIdAsync(appointmentId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(appointmentId);
            result.PatientId.Should().Be(patientId);
            result.PatientName.Should().Be("Alexis Hernandez");
            result.Reason.Should().Be("Chequeo");
            result.Notes.Should().Be("Pruebas");
            result.IsCompleted.Should().BeFalse();
        }

        [Fact]
        public async Task GetAllAsync_Test()
        {
            //Arrage:
            var appointments = new List<AppointmentResponseDto>
            {
                new AppointmentResponseDto
                {
                    Id = Guid.NewGuid(),
                    PatientId = Guid.NewGuid(),
                    PatientName = "Alexis Hernandez",
                    AppointmentDate = DateTime.UtcNow,
                    Reason = "Prueba",
                    Notes = "Prueba",
                    IsCompleted = false
                }, new AppointmentResponseDto
                {
                 Id = Guid.NewGuid(),
                    PatientId = Guid.NewGuid(),
                    PatientName = "Test User",
                    AppointmentDate = DateTime.UtcNow,
                    Reason = "Prueba",
                    Notes = "Prueba",
                    IsCompleted = false   
                }
            };
            _appointmentRepositoryMock.Setup(repo => repo.GetAllAsync()).ReturnsAsync(appointments);
            //Act
            var result = await _appointmentService.GetAllAsync();
            //Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().Contain(x =>
            x.PatientName == "Alexis Hernandez");
        }
        [Fact]
public async Task CreateAsync_WhenDtoIsValid_ShouldCreateAppointmentAndReturnResponseDto()
{
    // Arrange
    var patientId = Guid.NewGuid();

    var dto = new CreateAppointmentDto
    {
        PatientId = patientId,
        AppointmentDate = DateTime.UtcNow,
        Reason = "Test",
        Notes = "Test"
    };

    _appointmentRepositoryMock
        .Setup(repo => repo.CreateAsync(It.IsAny<Appointment>()))
        .ReturnsAsync((Appointment appointment) => appointment);

    _appointmentRepositoryMock
        .Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>()))
        .ReturnsAsync(new AppointmentResponseDto
        {
            Id = Guid.NewGuid(),
            PatientId = patientId,
            PatientName = "Alexis Hernandez",
            AppointmentDate = dto.AppointmentDate,
            Reason = dto.Reason,
            Notes = dto.Notes,
            IsCompleted = false
        });

    // Act
    var result = await _appointmentService.CreateAsync(dto);

    // Assert
    result.Should().NotBeNull();
    result!.Reason.Should().Be("Test");
    result.Notes.Should().Be("Test");

    _appointmentRepositoryMock.Verify(repo =>
        repo.CreateAsync(It.Is<Appointment>(appointment =>
            appointment.PatientId == patientId &&
            appointment.Reason == "Test" &&
            appointment.Notes == "Test" &&
            appointment.IsCompleted == false)),
        Times.Once);
}
        [Fact]
        public async Task UpdateAsync_WhenAppointmentDoesNotExist_ShouldThrowNotFoundException()
        {
            //arrage
            var appointmentId = Guid.NewGuid();
            var dto = new UpdateAppointmentDto
            {
                AppointmentDate = DateTime.UtcNow,
                Reason = "Update Test",
                Notes = "Update",
                IsCompleted = false
            };
            _appointmentRepositoryMock.Setup(repo => repo.GetByIdForUpdateAsync(appointmentId)).ReturnsAsync((Appointment?)null);
            //Act:
            var act = async () => await _appointmentService.UpdateAsync(appointmentId, dto);
            //Assert
            await act.Should()
            .ThrowAsync<NotFoundException>()
            .WithMessage("Appointment not found.");
        }
    }
}
