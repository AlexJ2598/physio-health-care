namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.Auth;
    using PhysioHealthCare.Application.Interfaces;

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService
                ?? throw new ArgumentNullException(nameof(authService));
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            var result = await authService.RegisterAsync(dto);

            return Ok(result);
        }


        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var result = await authService.LoginAsync(dto);

            return Ok(result);
        }
    }
}