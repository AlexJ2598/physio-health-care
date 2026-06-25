namespace PhysioHealthCare.Tests.Services
{
    using FluentAssertions;
    using Microsoft.Extensions.Logging;
    using Moq;
    using PhysioHealthCare.Application.DTOs.Auth;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Application.Services;
    using PhysioHealthCare.Domain.Entities;

    public class AuthServiceTest
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IPasswordHasher> _passwordHasherMock;
        private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
        private readonly Mock<ILogger<AuthService>> _loggerMock;
        private readonly AuthService _authService;

        public AuthServiceTest()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _passwordHasherMock = new Mock<IPasswordHasher>();
            _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();
            _loggerMock = new Mock<ILogger<AuthService>>();

            _authService = new AuthService(
                _userRepositoryMock.Object,
                _passwordHasherMock.Object,
                _jwtTokenGeneratorMock.Object,
                _loggerMock.Object);
        }
        [Fact]
        public async Task RegisterAsync_WhenEmailAlreadyExists_ShouldThrowBadRequestException()
        {
            // arrage
            var registerDto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@gmail.com",
                Password = "12345678",
                Role = "Admin"
            };
            _userRepositoryMock.Setup(repo => repo.ExistsByEmailAsync(registerDto
                .Email)).ReturnsAsync(true);
            
            //act
            Func<Task> act = async () =>
            await _authService.RegisterAsync(registerDto);


            // Assert

            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Email already exists.");
        }
        [Fact]
        public async Task RegisterAsync_WhenRoleIsInvalid_ShouldThrowBadRequestException()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@gmail.com",
                Password = "12345678",
                Role = "Test"
            };

            _userRepositoryMock
                .Setup(repo => repo.ExistsByEmailAsync(registerDto.Email))
                .ReturnsAsync(false);

            // Act
            var act = async () =>
                await _authService.RegisterAsync(registerDto);

            // Assert
            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Invalid role.");
        }
        [Fact]
        public async Task RegisterAsync_WhenValidData_ShouldReturnAuthResponseDto()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@gmail.com",
                Password = "12345678",
                Role = "Admin"
            };

            _userRepositoryMock
                .Setup(repo => repo.ExistsByEmailAsync(registerDto.Email))
                .ReturnsAsync(false);

            _passwordHasherMock
                .Setup(hasher => hasher.HashPassword(registerDto.Password))
                .Returns("hashed_password");

            _userRepositoryMock
                .Setup(repo => repo.CreateAsync(It.IsAny<User>()))
                .ReturnsAsync((User user) => user);

            _jwtTokenGeneratorMock
                .Setup(jwt => jwt.GenerateToken(It.IsAny<User>()))
                .Returns("fake_jwt_token");

            // Act
            var result = await _authService.RegisterAsync(registerDto);

            // Assert
            result.Should().NotBeNull();
            result.Email.Should().Be(registerDto.Email);
            result.FullName.Should().Be(registerDto.FullName);
            result.Role.Should().Be("Admin");
            result.Token.Should().Be("fake_jwt_token");
        }
        [Fact]
        public async Task RegisterAsync_WhenValidData_ShouldHashPassword()
        {
            // Arrange
            var registerdto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@test.com",
                Password = "password",
                Role = "Admin"
            };

            _userRepositoryMock
                .Setup(repo => repo.ExistsByEmailAsync(registerdto.Email))
                .ReturnsAsync(false);

            _passwordHasherMock
                .Setup(hasher => hasher.HashPassword(registerdto.Password))
                .Returns("Hash_Password");

            _userRepositoryMock
                .Setup(repo => repo.CreateAsync(It.IsAny<User>()))
                .ReturnsAsync((User user) => user);

            _jwtTokenGeneratorMock
                .Setup(jwt => jwt.GenerateToken(It.IsAny<User>()))
                .Returns("fake_token");

            // Act
            await _authService.RegisterAsync(registerdto);

            // Assert
            _passwordHasherMock.Verify(
                hasher => hasher.HashPassword(registerdto.Password),
                Times.Once);
        }
        [Fact]
        public async Task RegisterAsync_WhenValidData_ShouldGenerateJwtToken()
        {
            var dto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@test.com",
                Password = "password",
                Role = "Therapist"
            };
            _userRepositoryMock.Setup(repo => repo.ExistsByEmailAsync(dto.Email)).ReturnsAsync(false);
            _passwordHasherMock.Setup(repo => repo.HashPassword(dto.Password)).Returns("HashPassword");
            _jwtTokenGeneratorMock.Setup(repo => repo.GenerateToken(It.IsAny<User>())).Returns("FakeToken");
            _userRepositoryMock.Setup(repo => repo.CreateAsync(It.IsAny<User>())).ReturnsAsync((User user) => user);

            //Act
            var result = await _authService.RegisterAsync(dto);

            //Assert
            _jwtTokenGeneratorMock.Verify(jwt => jwt.GenerateToken(It.IsAny<User>()),Times.Once);

;        }

        [Fact]
        public async Task LoginAsync_WhenUserDoesNotExist_ShouldThrowBadRequestException()
        {
            // Arrange
            var dtoLogin = new LoginDto
            {
                Email = "test@test.com",
                Password = "password"
            };

            _userRepositoryMock
                .Setup(repo => repo.GetByEmailAsync(dtoLogin.Email))
                .ReturnsAsync((User?)null);

            // Act
            var act = async () =>
                await _authService.LoginAsync(dtoLogin);

            // Assert
            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Invalid email or password.");
        }

    }
}