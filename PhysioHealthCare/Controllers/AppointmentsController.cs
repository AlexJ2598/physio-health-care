namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.Appointments;
    using PhysioHealthCare.Application.Interfaces;

    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService
                ?? throw new ArgumentNullException(nameof(appointmentService));
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppointmentResponseDto>>> GetAll()
        {
            var appointments = await _appointmentService.GetAllAsync();

            return Ok(appointments);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<AppointmentResponseDto>> GetById(Guid id)
        {
            var appointment = await _appointmentService.GetByIdAsync(id);

            if (appointment == null)
            {
                return NotFound();
            }

            return Ok(appointment);
        }

        [HttpPost]
        public async Task<ActionResult<AppointmentResponseDto>> Create(CreateAppointmentDto dto)
        {
            var appointment = await _appointmentService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = appointment!.Id },
                appointment);
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<AppointmentResponseDto>> Update(
            Guid id,
            UpdateAppointmentDto dto)
        {
            var appointment =
                await _appointmentService.UpdateAsync(id, dto);

            if (appointment == null)
            {
                return NotFound();
            }

            return Ok(appointment);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
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