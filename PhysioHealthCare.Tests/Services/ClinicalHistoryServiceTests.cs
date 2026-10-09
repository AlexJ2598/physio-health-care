namespace PhysioHealthCare.Tests.Services
{
    using FluentAssertions;
    using Microsoft.Extensions.Logging;
    using Moq;
    using PhysioHealthCare.Application.DTOs.ClinicalRecords;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Application.Services;
    using PhysioHealthCare.Domain.Entities;
    using Xunit;

    public class ClinicalHistoryServiceTests
    {
        private readonly Mock<IClinicalRecordRepository> _recordRepositoryMock;
        private readonly Mock<IClinicalHistoryRepository> _historyRepositoryMock;
        private readonly Mock<ILogger<ClinicalHistoryService>> _loggerMock;
        private readonly ClinicalHistoryService _service;

        public ClinicalHistoryServiceTests()
        {
            _recordRepositoryMock =
                new Mock<IClinicalRecordRepository>();

            _historyRepositoryMock =
                new Mock<IClinicalHistoryRepository>();

            _loggerMock =
                new Mock<ILogger<ClinicalHistoryService>>();

            _service = new ClinicalHistoryService(
                _recordRepositoryMock.Object,
                _historyRepositoryMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateHistory_WhenRecordExists()
        {
            // Arrange
            var recordId = Guid.NewGuid();

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync(new ClinicalRecord
                {
                    Id = recordId,
                    IsActive = true
                });

            _historyRepositoryMock
                .Setup(x => x.ExistsForClinicalRecordIdAsync(recordId))
                .ReturnsAsync(false);

            _historyRepositoryMock
                .Setup(x => x.CreateAsync(It.IsAny<ClinicalHistory>()))
                .ReturnsAsync((ClinicalHistory history) => history);

            var dto = new CreateClinicalHistoryDto
            {
                ChiefComplaint = " Lower back pain ",
                CurrentCondition = " Persistent discomfort ",
                PainLevel = 6
            };

            // Act
            var result = await _service.CreateAsync(recordId, dto);

            // Assert
            result.Should().NotBeNull();
            result.ClinicalRecordId.Should().Be(recordId);
            result.ChiefComplaint.Should().Be("Lower back pain");
            result.CurrentCondition.Should().Be("Persistent discomfort");
            result.PainLevel.Should().Be(6);
            result.CreatedAt.Should().BeCloseTo(
                DateTime.UtcNow,
                TimeSpan.FromSeconds(10));

            _historyRepositoryMock.Verify(
                x => x.CreateAsync(
                    It.Is<ClinicalHistory>(history =>
                        history.ClinicalRecordId == recordId &&
                        history.ChiefComplaint == "Lower back pain" &&
                        history.PainLevel == 6 &&
                        history.IsActive)),
                Times.Once);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrowNotFound_WhenRecordDoesNotExist()
        {
            // Arrange
            var recordId = Guid.NewGuid();

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync((ClinicalRecord?)null);

            var dto = new CreateClinicalHistoryDto
            {
                ChiefComplaint = "Knee pain"
            };

            // Act
            Func<Task> act = () => _service.CreateAsync(recordId, dto);

            // Assert
            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Clinical record not found.");

            _historyRepositoryMock.Verify(
                x => x.CreateAsync(It.IsAny<ClinicalHistory>()),
                Times.Never);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrowBadRequest_WhenHistoryAlreadyExists()
        {
            // Arrange
            var recordId = Guid.NewGuid();

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync(new ClinicalRecord
                {
                    Id = recordId,
                    IsActive = true
                });

            _historyRepositoryMock
                .Setup(x => x.ExistsForClinicalRecordIdAsync(recordId))
                .ReturnsAsync(true);

            var dto = new CreateClinicalHistoryDto
            {
                ChiefComplaint = "Shoulder pain"
            };

            // Act
            Func<Task> act = () => _service.CreateAsync(recordId, dto);

            // Assert
            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage(
                    "Clinical record already has a clinical history.");

            _historyRepositoryMock.Verify(
                x => x.CreateAsync(It.IsAny<ClinicalHistory>()),
                Times.Never);
        }

        [Fact]
        public async Task GetByClinicalRecordIdAsync_ShouldReturnHistory_WhenExists()
        {
            // Arrange
            var recordId = Guid.NewGuid();
            var historyId = Guid.NewGuid();

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync(new ClinicalRecord
                {
                    Id = recordId,
                    IsActive = true
                });

            _historyRepositoryMock
                .Setup(x => x.GetByClinicalRecordIdAsync(recordId))
                .ReturnsAsync(new ClinicalHistory
                {
                    Id = historyId,
                    ClinicalRecordId = recordId,
                    ChiefComplaint = "Neck pain",
                    PainLevel = 4,
                    IsActive = true
                });

            // Act
            var result =
                await _service.GetByClinicalRecordIdAsync(recordId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(historyId);
            result.ClinicalRecordId.Should().Be(recordId);
            result.ChiefComplaint.Should().Be("Neck pain");
            result.PainLevel.Should().Be(4);
        }

        [Fact]
        public async Task GetByClinicalRecordIdAsync_ShouldReturnNull_WhenHistoryDoesNotExist()
        {
            // Arrange
            var recordId = Guid.NewGuid();

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync(new ClinicalRecord
                {
                    Id = recordId,
                    IsActive = true
                });

            _historyRepositoryMock
                .Setup(x => x.GetByClinicalRecordIdAsync(recordId))
                .ReturnsAsync((ClinicalHistory?)null);

            // Act
            var result =
                await _service.GetByClinicalRecordIdAsync(recordId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task GetByClinicalRecordIdAsync_ShouldThrowNotFound_WhenRecordDoesNotExist()
        {
            // Arrange
            var recordId = Guid.NewGuid();

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync((ClinicalRecord?)null);

            // Act
            Func<Task> act = () =>
                _service.GetByClinicalRecordIdAsync(recordId);

            // Assert
            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Clinical record not found.");

            _historyRepositoryMock.Verify(
                x => x.GetByClinicalRecordIdAsync(It.IsAny<Guid>()),
                Times.Never);
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateHistory_WhenHistoryExists()
        {
            // Arrange
            var recordId = Guid.NewGuid();
            var historyId = Guid.NewGuid();
            var createdAt = DateTime.UtcNow.AddDays(-3);

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync(new ClinicalRecord
                {
                    Id = recordId,
                    IsActive = true
                });

            _historyRepositoryMock
                .Setup(x => x.GetByClinicalRecordIdAsync(recordId))
                .ReturnsAsync(new ClinicalHistory
                {
                    Id = historyId,
                    ClinicalRecordId = recordId,
                    ChiefComplaint = "Original complaint",
                    PainLevel = 8,
                    CreatedAt = createdAt,
                    IsActive = true
                });

            _historyRepositoryMock
                .Setup(x => x.UpdateAsync(It.IsAny<ClinicalHistory>()))
                .ReturnsAsync((ClinicalHistory history) => history);

            var dto = new UpdateClinicalHistoryDto
            {
                ChiefComplaint = " Improved knee pain ",
                PainLevel = 3,
                Notes = " Patient improving "
            };

            // Act
            var result = await _service.UpdateAsync(recordId, dto);

            // Assert
            result.Id.Should().Be(historyId);
            result.ChiefComplaint.Should().Be("Improved knee pain");
            result.PainLevel.Should().Be(3);
            result.Notes.Should().Be("Patient improving");
            result.CreatedAt.Should().Be(createdAt);
            result.UpdatedAt.Should().NotBeNull();

            _historyRepositoryMock.Verify(
                x => x.UpdateAsync(
                    It.Is<ClinicalHistory>(history =>
                        history.Id == historyId &&
                        history.ChiefComplaint == "Improved knee pain" &&
                        history.PainLevel == 3 &&
                        history.UpdatedAt.HasValue)),
                Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ShouldThrowNotFound_WhenHistoryDoesNotExist()
        {
            // Arrange
            var recordId = Guid.NewGuid();

            _recordRepositoryMock
                .Setup(x => x.GetByIdAsync(recordId))
                .ReturnsAsync(new ClinicalRecord
                {
                    Id = recordId,
                    IsActive = true
                });

            _historyRepositoryMock
                .Setup(x => x.GetByClinicalRecordIdAsync(recordId))
                .ReturnsAsync((ClinicalHistory?)null);

            var dto = new UpdateClinicalHistoryDto
            {
                ChiefComplaint = "Back pain"
            };

            // Act
            Func<Task> act = () => _service.UpdateAsync(recordId, dto);

            // Assert
            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Clinical history not found.");

            _historyRepositoryMock.Verify(
                x => x.UpdateAsync(It.IsAny<ClinicalHistory>()),
                Times.Never);
        }
    }
}
