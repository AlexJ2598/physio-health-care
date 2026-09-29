namespace PhysioHealthCare.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using PhysioHealthCare.Application.DTOs.Dashboard;
    using PhysioHealthCare.Application.Exceptions;
    using PhysioHealthCare.Application.Interfaces;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]

    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService ?? throw new ArgumentNullException(nameof(dashboardService));
        }
        [HttpGet]
        public async Task<ActionResult<DashboardSummaryDto>>GetSummary(
            [FromQuery] DateTime dateFrom,
            [FromQuery] DateTime dateTo)
        {
            if(dateFrom.Kind != DateTimeKind.Utc || dateTo.Kind != DateTimeKind.Utc)
            {
                throw new BadRequestException("dateFrom and dateTo must be in UTC format.");
            }
            if(dateFrom >= dateTo)
            {
                throw new BadRequestException("DateFrom must be earlier than DateTo.");
            }
            var summary = await _dashboardService
                .GetDashboardSummaryAsync(dateFrom, dateTo, DateTime.UtcNow);
            return Ok(summary);
        }
    }
}
