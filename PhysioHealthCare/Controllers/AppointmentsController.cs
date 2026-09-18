namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.DTOs.Common;
    using PhysioHealthCare.Application.Interfaces;
    using PhysioHealthCare.Domain.Enums;

    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(
            IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService
                ?? throw new ArgumentNullException(
                    nameof(appointmentService));
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<AppointmentResponseDto>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? patientId = null,
        [FromQuery] AppointmentStatus? status = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
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

            if (
                dateFrom.HasValue &&
                dateFrom.Value.Kind != DateTimeKind.Utc)
            {
                return BadRequest(
                    "Date from must be in UTC.");
            }

            if (
                dateTo.HasValue &&
                dateTo.Value.Kind != DateTimeKind.Utc)
            {
                return BadRequest(
                    "Date to must be in UTC.");
            }

            if (
                dateFrom.HasValue &&
                dateTo.HasValue &&
                dateFrom.Value > dateTo.Value)
            {
                return BadRequest(
                    "Date from must be less than or equal to date to.");
            }

            var allowedSortFields = new[]
            {
               "appointmentDate",
               "patientName",
               "status",
               "reason"
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
                await _appointmentService.GetPagedAsync(
                    pageNumber,
                    pageSize,
                    patientId,
                    status,
                    dateFrom,
                    dateTo,
                    search,
                    sortBy,
                    sortDirection);

            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<AppointmentResponseDto>> GetById(
            Guid id)
        {
            var appointment =
                await _appointmentService.GetByIdAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            return Ok(appointment);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AppointmentResponseDto>> Create(
            CreateAppointmentDto dto)
        {
            var appointment =
                await _appointmentService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = appointment!.Id },
                appointment);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AppointmentResponseDto>> Update(
            Guid id,
            UpdateAppointmentDto dto)
        {
            var appointment =
                await _appointmentService.UpdateAsync(
                    id,
                    dto);

            if (appointment == null)
            {
                return NotFound();
            }

            return Ok(appointment);
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AppointmentResponseDto>> UpdateStatus(
            Guid id,
            UpdateAppointmentStatusDto dto)
        {
            var appointment =
                await _appointmentService.UpdateStatusAsync(
                    id,
                    dto);

            return Ok(appointment);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(
            Guid id)
        {
            var deleted =
                await _appointmentService.SoftDeleteAsync(id);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}