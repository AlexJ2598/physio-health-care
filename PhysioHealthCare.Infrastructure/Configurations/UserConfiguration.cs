namespace PhysioHealthCare.Infrastructure.Configurations
{
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    using PhysioHealthCare.Domain.Entities;
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> entity)
        {
            entity.ToTable("Users");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.FullName).HasMaxLength(100).IsRequired();

            entity.Property(x => x.Email).HasMaxLength(100).IsRequired();
            entity.HasIndex(x => x.Email).IsUnique();
            
            entity.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();

            entity.Property(x => x.Role)
           .HasConversion<int>()
           .IsRequired();

        }
    }
}
