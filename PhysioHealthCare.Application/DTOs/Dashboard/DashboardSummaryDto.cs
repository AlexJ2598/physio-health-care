namespace PhysioHealthCare.Application.DTOs.Dashboard
{
    public class DashboardSummaryDto
    {
        public int TodayAppointments { get; set; }
        public int TodayScheduled { get; set; }
        public int TodayInProgress { get; set; }
        public int TodayCompleted { get; set; }

        public int HistoricalCompleted { get; set; }
        public int HistoricalCancelled { get; set; }

        public DashboardAppointmentDto? CurrentAppointment { get; set; }
        public DashboardAppointmentDto? NextAppointment { get; set; }
    }
}