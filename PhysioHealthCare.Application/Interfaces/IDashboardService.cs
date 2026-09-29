namespace PhysioHealthCare.Application.Interfaces
{
    using PhysioHealthCare.Application.DTOs.Dashboard;
    public interface IDashboardService
    {

        Task<DashboardSummaryDto> GetDashboardSummaryAsync(
            DateTime dateFrom,
            DateTime dateTo,
            DateTime currentDateTime);
    }
}
