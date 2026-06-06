namespace PhysioHealthCare.Application.DTOs.Patients
{

    public class PatientResponseDto
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public DateTime BirthDate { get; set; }

        public string Gender { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }
}
