namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.Common;
    using PhysioHealthCare.Application.DTOs.Patients;
    using PhysioHealthCare.Application.Interfaces;

    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientsController(
            IPatientService patientService)
        {
            _patientService = patientService
                ?? throw new ArgumentNullException(
                    nameof(patientService));
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<PatientResponseDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string sortDirection = "asc")
        {
            if (pageNumber < 1)
            {
                return BadRequest(
                    "Page number must be greater than or equal to 1.");
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest(
                    "Page size must be between 1 and 100.");
            }

            var allowedSortFields = new[]
            {
                "fullName",
                "birthDate",
                "gender",
                "phoneNumber",
                "email"
            };

            if (
                !string.IsNullOrWhiteSpace(sortBy) &&
                !allowedSortFields.Contains(
                    sortBy,
                    StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "Invalid sort field.");
            }

            if (
                !string.Equals(
                    sortDirection,
                    "asc",
                    StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(
                    sortDirection,
                    "desc",
                    StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "Sort direction must be 'asc' or 'desc'.");
            }

            var result =
                await _patientService.GetPagedAsync(
                    pageNumber,
                    pageSize,
                    search,
                    sortBy,
                    sortDirection);

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PatientResponseDto>> Create(
            CreatePatientDto dto)
        {
            var patient =
                await _patientService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = patient.Id
                },
                patient);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            Guid id,
            UpdatePatientDto dto)
        {
            var patient =
                await _patientService.UpdateAsync(
                    id,
                    dto);

            if (patient == null)
            {
                return NotFound();
            }

            return Ok(patient);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(
            Guid id)
        {
            var deleted =
                await _patientService.SoftDeleteAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(
            Guid id)
        {
            var patient =
                await _patientService.GetByIdAsync(id);

            if (patient == null)
            {
                return NotFound();
            }

            return Ok(patient);
        }
    }
}