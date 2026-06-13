namespace PhysioHealthCare.Application.Validators.Appointments
{
    using FluentValidation;
    using PhysioHealthCare.Application.DTOs.Appointments;

    public class CreateAppointmentDtoValidator
        : AbstractValidator<CreateAppointmentDto>
    {
        public CreateAppointmentDtoValidator()
        {
            RuleFor(x => x.PatientId)
                .NotEmpty();

            RuleFor(x => x.AppointmentDate)
                .GreaterThan(DateTime.Now);

            RuleFor(x => x.Reason)
                .NotEmpty()
                .MaximumLength(250);

            RuleFor(x => x.Notes)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.Notes));
        }
    }
}