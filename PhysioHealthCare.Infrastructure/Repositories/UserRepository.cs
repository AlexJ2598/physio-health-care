namespace PhysioHealthCare.Infrastructure.Repositories
{
    using Microsoft.EntityFrameworkCore;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Entities;
    using PhysioHealthCare.Infrastructure.Data;
    using System.Threading.Tasks;

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            if(context == null) throw new ArgumentNullException(nameof(context));
            _context = context;
        }

        public async Task<User> CreateAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(x => x.Email == email && x.IsActive);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return  await _context.Users.FirstOrDefaultAsync(x => x.Email == email && x.IsActive);
        }
    }
}
