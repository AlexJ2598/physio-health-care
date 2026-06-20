namespace PhysioHealthCare.Tests.Services
{
    using FluentAssertions;
    using Microsoft.Extensions.Logging;
    using Moq;
    using PhysioHealthCare.Application.DTOs.Patients;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Application.Services;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;
    using PhysioHealthCare.Infrastructure.Repositories;

    public class PatientServiceTests
    {
        private readonly Mock<IPatientRepository> _patientRepositoryMock;
        private readonly Mock<ILogger<PatientService>> _loggerMock;
        private readonly PatientService _patientService;

        public PatientServiceTests()
        {
            _patientRepositoryMock = new Mock<IPatientRepository>();
            _loggerMock = new Mock<ILogger<PatientService>>();

            _patientService = new PatientService(
                _patientRepositoryMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task GetByIdAsync_WhenPatientDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(repo => repo.GetByIdAsync(patientId))
                .ReturnsAsync((Patient?)null);

            // Act
            var act = async () => await _patientService.GetByIdAsync(patientId);

            // Assert
            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage("Patient not found.");
        }
        [Fact]
        public async Task GetByIdAsync_WhenPatientExists_ShouldReturnPatientResponseDto()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            var patient = new Patient
            {
                Id = patientId,
                FirstName = "Alexis",
                LastName = "Hernandez",
                BirthDate = new DateTime(1995, 1, 1),
                Gender = Gender.Male,
                PhoneNumber = "2221234567",
                Email = "alexis@test.com",
                IsActive = true
            };

            _patientRepositoryMock
                .Setup(repo => repo.GetByIdAsync(patientId))
                .ReturnsAsync(patient);

            // Act
            var result = await _patientService.GetByIdAsync(patientId);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(patientId);
            result.FullName.Should().Be("Alexis Hernandez");
            result.Email.Should().Be("alexis@test.com");
        }
        [Fact]
        public async Task GetAllAsync_WhenPatientsExist_ShouldReturnPatientResponseDtoList()
        {
            // Arrange
            var patients = new List<Patient>
            {
             new Patient
             {
            Id = Guid.NewGuid(),
            FirstName = "Alexis",
            LastName = "Hernandez",
            BirthDate = new DateTime(1995, 1, 1),
            Gender = Gender.Male,
            PhoneNumber = "2221234567",
            Email = "alexis@test.com",
            IsActive = true
        },
        new Patient
        {
            Id = Guid.NewGuid(),
            FirstName = "Ana",
            LastName = "Lopez",
            BirthDate = new DateTime(1998, 5, 10),
            Gender = Gender.Female,
            PhoneNumber = "2229876543",
            Email = "ana@test.com",
            IsActive = true
        }
    };

            _patientRepositoryMock
                .Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(patients);

            // Act
            var result = await _patientService.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result[0].FullName.Should().Be("Alexis Hernandez");
            result[1].FullName.Should().Be("Ana Lopez");
        }

        [Fact]
        public async Task CreateAsync_WhenDtoIsValid_ShouldCreatePatientAndReturnResponseDto()
        {
            // Arrange
            var dto = new CreatePatientDto
            {
                FirstName = " Alexis ",
                LastName = " Hernandez ",
                BirthDate = new DateTime(1995, 1, 1),
                Gender = 1,
                PhoneNumber = " 2221234567 ",
                Email = " alexis@test.com ",
                Address = " Puebla ",
                Notes = " Test patient "
            };

            _patientRepositoryMock
                .Setup(repo => repo.CreateAsync(It.IsAny<Patient>()))
                .ReturnsAsync((Patient patient) => patient);

            // Act
            var result = await _patientService.CreateAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.FullName.Should().Be("Alexis Hernandez");
            result.Email.Should().Be("alexis@test.com");

            _patientRepositoryMock.Verify(
                repo => repo.CreateAsync(It.Is<Patient>(patient =>
                    patient.FirstName == "Alexis" &&
                    patient.LastName == "Hernandez" &&
                    patient.Email == "alexis@test.com" &&
                    patient.IsActive)),
                Times.Once);
        }
        [Fact]
        public async Task UpdateAsync_WhenPatientDoesNotExist_ShouldThrowBadRequestException()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            var dto = new UpdatePatientDto
            {
                FirstName = "Alexis",
                LastName = "Hernandez",
                BirthDate = new DateTime(1995, 1, 1),
                Gender = 1
            };

            _patientRepositoryMock
                .Setup(repo => repo.GetByIdForUpdateAsync(patientId))
                .ReturnsAsync((Patient?)null);

            // Act
            var act = async () => await _patientService.UpdateAsync(patientId, dto);

            // Assert
            await act.Should().ThrowAsync<BadRequestException>()
                .WithMessage("Patient does not exist.");
        }
        [Fact]
        public async Task UpdateAsync_WhenPatientExists_ShouldUpdatePatientAndReturnResponseDto()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            var existingPatient = new Patient
            {
                Id = patientId,
                FirstName = "Old",
                LastName = "Name",
                BirthDate = new DateTime(1990, 1, 1),
                Gender = Gender.Male,
                PhoneNumber = "111",
                Email = "old@test.com",
                Address = "Old address",
                Notes = "Old notes",
                IsActive = true
            };

            var dto = new UpdatePatientDto
            {
                FirstName = "Alexis",
                LastName = "Hernandez",
                BirthDate = new DateTime(1995, 1, 1),
                Gender = 1,
                PhoneNumber = "2221234567",
                Email = "alexis@test.com",
                Address = "Puebla",
                Notes = "Updated notes"
            };

            _patientRepositoryMock
                .Setup(repo => repo.GetByIdForUpdateAsync(patientId))
                .ReturnsAsync(existingPatient);

            _patientRepositoryMock
                .Setup(repo => repo.UpdateAsync(It.IsAny<Patient>()))
                .ReturnsAsync((Patient patient) => patient);

            // Act
            var result = await _patientService.UpdateAsync(patientId, dto);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(patientId);
            result.FullName.Should().Be("Alexis Hernandez");
            result.Email.Should().Be("alexis@test.com");

            _patientRepositoryMock.Verify(
                repo => repo.UpdateAsync(It.Is<Patient>(patient =>
                    patient.Id == patientId &&
                    patient.FirstName == "Alexis" &&
                    patient.LastName == "Hernandez" &&
                    patient.Email == "alexis@test.com" &&
                    patient.UpdatedAt != null)),
                Times.Once);
        }
        [Fact]
        public async Task SoftDeleteAsync_WhenPatientExists_ShouldReturnTrue()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(repo => repo.SoftDeleteAsync(patientId))
                .ReturnsAsync(true);

            // Act
            var result = await _patientService.SoftDeleteAsync(patientId);

            // Assert
            result.Should().BeTrue();

            _patientRepositoryMock.Verify(
                repo => repo.SoftDeleteAsync(patientId),
                Times.Once);
        }
        [Fact]
        public async Task SoftDeleteAsync_WhenPatientDoesNotExist_ShouldThrowNotFoundException()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(repo => repo.SoftDeleteAsync(patientId))
                .ReturnsAsync(false);

            // Act
            var act = async () => await _patientService.SoftDeleteAsync(patientId);

            // Assert
            await act.Should().ThrowAsync<NotFoundException>()
                .WithMessage("Patient not found.");
        }
    }
}
