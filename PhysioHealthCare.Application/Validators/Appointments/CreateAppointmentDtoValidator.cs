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
                .Must(appointmentDate =>
                    appointmentDate.Kind == DateTimeKind.Utc)
                .WithMessage(
                    "Appointment date must be in UTC.")
                .GreaterThan(DateTime.UtcNow)
                .WithMessage(
                    "Appointment date must be in the future.");

            RuleFor(x => x.Reason)
                .NotEmpty()
                .MaximumLength(250);

            RuleFor(x => x.Notes)
                .MaximumLength(500)
                .When(x =>
                    !string.IsNullOrWhiteSpace(x.Notes));
        }
    }
}