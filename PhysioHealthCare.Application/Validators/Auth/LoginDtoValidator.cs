namespace PhysioHealthCare.Application.Validators.Auth
{
    using FluentValidation;
    using PhysioHealthCare.Application.DTOs.Auth;
    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().MaximumLength(100).EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MaximumLength(250);
        }
    }
}
