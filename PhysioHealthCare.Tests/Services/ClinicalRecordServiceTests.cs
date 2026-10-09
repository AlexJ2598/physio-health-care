
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using PhysioHealthCare.Application.Exceptions;
using PhysioHealthCare.Application.Interfaces;
using PhysioHealthCare.Application.Services;
using PhysioHealthCare.Domain.Entities;
using Xunit;

namespace PhysioHealthCare.Tests.Services
{
    public class ClinicalRecordServiceTests
    {
        private readonly Mock<IClinicalRecordRepository> _clinicalRecordRepositoryMock;
        private readonly Mock<IPatientRepository> _patientRepositoryMock;
        private readonly Mock<ILogger<ClinicalRecordService>> _loggerMock;
        private readonly ClinicalRecordService _service;

        public ClinicalRecordServiceTests()
        {
            _clinicalRecordRepositoryMock =
                new Mock<IClinicalRecordRepository>();

            _patientRepositoryMock =
                new Mock<IPatientRepository>();

            _loggerMock =
                new Mock<ILogger<ClinicalRecordService>>();

            _service = new ClinicalRecordService(
                _clinicalRecordRepositoryMock.Object,
                _patientRepositoryMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateClinicalRecord_WhenPatientExists()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            var patient = new Patient
            {
                Id = patientId,
                IsActive = true
            };

            _patientRepositoryMock
                .Setup(x => x.GetByIdAsync(patientId))
                .ReturnsAsync(patient);

            _clinicalRecordRepositoryMock
                .Setup(x => x.ExistsForPatientIdAsync(patientId))
                .ReturnsAsync(false);

            _clinicalRecordRepositoryMock
                .Setup(x => x.GetNextRecordNumberAsync())
                .ReturnsAsync(1L);

            _clinicalRecordRepositoryMock
                .Setup(x => x.CreateAsync(It.IsAny<ClinicalRecord>()))
                .ReturnsAsync((ClinicalRecord record) => record);

            // Act
            var result = await _service.CreateAsync(patientId);

            // Assert
            result.Should().NotBeNull();
            result.PatientId.Should().Be(patientId);
            result.RecordNumber.Should().Be("PHC-000001");
            result.HasClinicalHistory.Should().BeFalse();

            _clinicalRecordRepositoryMock.Verify(
                x => x.CreateAsync(
                    It.Is<ClinicalRecord>(record =>
                        record.PatientId == patientId &&
                        record.RecordNumber == "PHC-000001" &&
                        record.IsActive)),
                Times.Once);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrowNotFoundException_WhenPatientDoesNotExist()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(x => x.GetByIdAsync(patientId))
                .ReturnsAsync((Patient?)null);

            // Act
            Func<Task> act = () => _service.CreateAsync(patientId);

            // Assert
            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Patient not found.");

            _clinicalRecordRepositoryMock.Verify(
                x => x.CreateAsync(It.IsAny<ClinicalRecord>()),
                Times.Never);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrowBadRequestException_WhenRecordAlreadyExists()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(x => x.GetByIdAsync(patientId))
                .ReturnsAsync(new Patient
                {
                    Id = patientId,
                    IsActive = true
                });

            _clinicalRecordRepositoryMock
                .Setup(x => x.ExistsForPatientIdAsync(patientId))
                .ReturnsAsync(true);

            // Act
            Func<Task> act = () => _service.CreateAsync(patientId);

            // Assert
            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Patient already has a clinical record.");

            _clinicalRecordRepositoryMock.Verify(
                x => x.GetNextRecordNumberAsync(),
                Times.Never);

            _clinicalRecordRepositoryMock.Verify(
                x => x.CreateAsync(It.IsAny<ClinicalRecord>()),
                Times.Never);
        }

        [Fact]
        public async Task GetByPatientIdAsync_ShouldReturnClinicalRecord_WhenRecordExists()
        {
            // Arrange
            var patientId = Guid.NewGuid();
            var clinicalRecordId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(x => x.GetByIdAsync(patientId))
                .ReturnsAsync(new Patient
                {
                    Id = patientId,
                    IsActive = true
                });

            _clinicalRecordRepositoryMock
                .Setup(x => x.GetByPatientIdAsync(patientId))
                .ReturnsAsync(new ClinicalRecord
                {
                    Id = clinicalRecordId,
                    PatientId = patientId,
                    RecordNumber = "PHC-000015",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    ClinicalHistory = new ClinicalHistory
                    {
                        Id = Guid.NewGuid(),
                        IsActive = true
                    }
                });

            // Act
            var result = await _service.GetByPatientIdAsync(patientId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(clinicalRecordId);
            result.PatientId.Should().Be(patientId);
            result.RecordNumber.Should().Be("PHC-000015");
            result.HasClinicalHistory.Should().BeTrue();
        }

        [Fact]
        public async Task GetByPatientIdAsync_ShouldReturnNull_WhenRecordDoesNotExist()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(x => x.GetByIdAsync(patientId))
                .ReturnsAsync(new Patient
                {
                    Id = patientId,
                    IsActive = true
                });

            _clinicalRecordRepositoryMock
                .Setup(x => x.GetByPatientIdAsync(patientId))
                .ReturnsAsync((ClinicalRecord?)null);

            // Act
            var result = await _service.GetByPatientIdAsync(patientId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByPatientIdAsync_ShouldThrowNotFoundException_WhenPatientDoesNotExist()
        {
            // Arrange
            var patientId = Guid.NewGuid();

            _patientRepositoryMock
                .Setup(x => x.GetByIdAsync(patientId))
                .ReturnsAsync((Patient?)null);

            // Act
            Func<Task> act = () =>
                _service.GetByPatientIdAsync(patientId);

            // Assert
            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Patient not found.");

            _clinicalRecordRepositoryMock.Verify(
                x => x.GetByPatientIdAsync(It.IsAny<Guid>()),
                Times.Never);
        }
    }
}
