namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Domain.Entities;

    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);

        Task<User> CreateAsync(User user);

        Task<bool> ExistsByEmailAsync(string email);
    }
}