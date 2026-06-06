namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.Patients;
    using PhysioHealthCare.Application.Interfaces;

    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientsController(IPatientService patientService)
        {
            _patientService = patientService
                ?? throw new ArgumentNullException(nameof(patientService));
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<PatientResponseDto>>> GetAll()
        {
            var patients = await _patientService.GetAllAsync();

            return Ok(patients);
        }

        [HttpPost]
        public async Task<ActionResult<PatientResponseDto>> Create(CreatePatientDto dto)
        {
            var patient = await _patientService.CreateAsync(dto);

            return Ok(patient);
        }
    }
}