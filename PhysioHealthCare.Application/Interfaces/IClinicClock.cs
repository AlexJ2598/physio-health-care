namespace PhysioHealthCare.Application.Interfaces
{
    public interface IClinicClock
    {
        DateTime UtcNow { get; }

        DateTime LocalNow { get; }

        DateOnly Today { get; }

        TimeZoneInfo TimeZone { get; }

        DateTime ConvertLocalToUtc(DateTime localDateTime);

        DateTime ConvertUtcToLocal(DateTime utcDateTime);
    }
}