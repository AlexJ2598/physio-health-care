namespace PhysioHealthCare.Application.Services
{
    using Microsoft.Extensions.Logging;
    using PhysioHealthCare.Application.DTOs.Auth;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Domain.Enums;

    public class AuthService : IAuthService
    {
        private readonly IUserRepository userRepository;
        private readonly IPasswordHasher passwordHasher;
        private readonly IJwtTokenGenerator jwtTokenGenerator;
        private readonly ILogger<AuthService> logger;

        public AuthService(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator,
            ILogger<AuthService> logger)
        {
            this.userRepository = userRepository;
            this.passwordHasher = passwordHasher;
            this.jwtTokenGenerator = jwtTokenGenerator;
            this.logger = logger;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            logger.LogInformation("Registering new user with email {Email}", dto.Email);

            var exists = await userRepository.ExistsByEmailAsync(dto.Email);

            if (exists)
            {
                logger.LogWarning("Register failed. Email already exists: {Email}", dto.Email);
                throw new BadRequestException("Email already exists.");
            }

            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
            {
                throw new BadRequestException("Invalid role.");
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = passwordHasher.HashPassword(dto.Password),
                Role = role
            };

            await userRepository.CreateAsync(user);

            var token = jwtTokenGenerator.GenerateToken(user);

            logger.LogInformation("User registered successfully with UserId {UserId}", user.Id);

            return new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                Token = token
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            logger.LogInformation("Login attempt for email {Email}", dto.Email);

            var user = await userRepository.GetByEmailAsync(dto.Email);

            if (user is null)
            {
                logger.LogWarning("Login failed. User not found for email {Email}", dto.Email);
                throw new BadRequestException("Invalid email or password.");
            }

            var isPasswordValid = passwordHasher.VerifyPassword(dto.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                logger.LogWarning("Login failed. Invalid password for email {Email}", dto.Email);
                throw new BadRequestException("Invalid email or password.");
            }

            var token = jwtTokenGenerator.GenerateToken(user);

            logger.LogInformation("User logged in successfully with UserId {UserId}", user.Id);

            return new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                Token = token
            };
        }
    }
}