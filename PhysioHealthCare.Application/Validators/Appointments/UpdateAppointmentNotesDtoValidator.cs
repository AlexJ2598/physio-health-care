namespace PhysioHealthCare.Application.Validators.Appointments
{
    using FluentValidation;
    using PhysioHealthCare.Application.DTOs.Appointments;
    public class UpdateAppointmentNotesDtoValidator : AbstractValidator<UpdateAppointmentNotesDto>
    {
        public UpdateAppointmentNotesDtoValidator()
        {
            RuleFor(x => x.Notes)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.Notes));
        }
    }
}
