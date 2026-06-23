namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PatientResponseDto>> Create(CreatePatientDto dto)
        {
            var patient = await _patientService.CreateAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
        }
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, UpdatePatientDto dto)
        {
            var patient = await _patientService.UpdateAsync(id, dto);

            if (patient == null)
                return NotFound();

            return Ok(patient);
        }
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _patientService.SoftDeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var person = await _patientService.GetByIdAsync(id);
            if(person == null)
            {
                return NotFound();
            }

            return Ok(person);

        }
    }
}