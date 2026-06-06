namespace PhysioHealthCare.Application.DTOs.Patients
{
    public class CreatePatientDto
    {
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public DateTime BirthDate { get; set; }

        public int Gender { get; set; }

        public string PhoneNumber { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;
    }
}
