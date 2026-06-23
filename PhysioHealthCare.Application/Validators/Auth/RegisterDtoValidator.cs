namespace PhysioHealthCare.Application.Validators.Auth
{
    using FluentValidation;
    using PhysioHealthCare.Application.DTOs.Auth;
    using PhysioHealthCare.Domain.Enums;

    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);

            RuleFor(x => x.Email).NotEmpty().MaximumLength(100).EmailAddress();

            RuleFor(x => x.Password).NotEmpty().MinimumLength(8).MaximumLength(250);

            RuleFor(x => x.Role).NotEmpty()
                .Must(role => Enum.TryParse<UserRole>(role, true, out _))
                .WithMessage("Role must be Admin or Therapist."); 
        }
    }
}
