namespace PhysioHealthCare.Application.Validators.Appointments
{
    using FluentValidation;
    using PhysioHealthCare.Application.DTOs.Appointments;

    public class UpdateAppointmentStatusDtoValidator
        : AbstractValidator<UpdateAppointmentStatusDto>
    {
        public UpdateAppointmentStatusDtoValidator()
        {
            RuleFor(x => x.Status)
                .IsInEnum();
        }
    }
}