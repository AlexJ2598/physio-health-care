namespace PhysioHealthCare.Application.Validators.Patients
{
    using FluentValidation;
    using PhysioHealthCare.Application.DTOs.Patients;

    public class CreatePatientDtoValidator : AbstractValidator<CreatePatientDto>
    {
        public CreatePatientDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.LastName)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.BirthDate)
                .NotEmpty()
                .LessThan(DateTime.Today);

            RuleFor(x => x.Gender)
                .InclusiveBetween(1, 3);

            RuleFor(x => x.PhoneNumber)
                .MaximumLength(20)
                .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));

            RuleFor(x => x.Email)
                .EmailAddress()
                .MaximumLength(150)
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.Address)
                .MaximumLength(250)
                .When(x => !string.IsNullOrWhiteSpace(x.Address));

            RuleFor(x => x.Notes)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.Notes));
        }
    }
}
