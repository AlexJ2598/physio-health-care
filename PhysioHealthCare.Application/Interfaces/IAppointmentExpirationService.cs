namespace PhysioHealthCare.Application.Interfaces
{
    public interface IAppointmentExpirationService
    {
        Task<int> CancelExpiredAppointmentsAsync();
    }
}
