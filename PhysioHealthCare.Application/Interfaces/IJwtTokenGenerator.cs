namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Domain.Entities;

    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
    }
}