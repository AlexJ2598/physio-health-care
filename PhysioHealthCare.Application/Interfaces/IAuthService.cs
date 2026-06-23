namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.Auth;

    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);

        Task<AuthResponseDto> LoginAsync(LoginDto dto);
    }
}