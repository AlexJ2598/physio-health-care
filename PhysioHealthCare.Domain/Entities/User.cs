namespace PhysioHealthCare.Domain.Entities
{
    using PhysioHealthCare.Domain.Common;
    using PhysioHealthCare.Domain.Enums;

    public class User : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; } 
    }
}
