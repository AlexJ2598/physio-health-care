namespace PhysioHealthCare.Infrastructure.Services
{
    using Microsoft.Extensions.Configuration;
    using PhysioHealthCare.Application.Interfaces;

    public class ClinicClock : IClinicClock
    {
        private readonly TimeZoneInfo _timeZone;

        public ClinicClock(IConfiguration configuration)
        {
            ArgumentNullException.ThrowIfNull(configuration);

            var timeZoneId =
                configuration["ClinicSettings:TimeZoneId"];

            if (string.IsNullOrWhiteSpace(timeZoneId))
            {
                throw new InvalidOperationException(
                    "ClinicSettings:TimeZoneId is not configured.");
            }

            _timeZone = ResolveTimeZone(timeZoneId);
        }

        public DateTime UtcNow => DateTime.UtcNow;

        public DateTime LocalNow =>
            TimeZoneInfo.ConvertTimeFromUtc(
                UtcNow,
                _timeZone);

        public DateOnly Today =>
            DateOnly.FromDateTime(LocalNow);

        public TimeZoneInfo TimeZone => _timeZone;

        public DateTime ConvertLocalToUtc(
            DateTime localDateTime)
        {
            var unspecifiedDateTime =
                DateTime.SpecifyKind(
                    localDateTime,
                    DateTimeKind.Unspecified);

            return TimeZoneInfo.ConvertTimeToUtc(
                unspecifiedDateTime,
                _timeZone);
        }

        public DateTime ConvertUtcToLocal(
            DateTime utcDateTime)
        {
            var normalizedUtc =
                DateTime.SpecifyKind(
                    utcDateTime,
                    DateTimeKind.Utc);

            return TimeZoneInfo.ConvertTimeFromUtc(
                normalizedUtc,
                _timeZone);
        }

        private static TimeZoneInfo ResolveTimeZone(
            string timeZoneId)
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(
                    timeZoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                throw new InvalidOperationException(
                    $"The configured clinic time zone '{timeZoneId}' was not found.");
            }
            catch (InvalidTimeZoneException)
            {
                throw new InvalidOperationException(
                    $"The configured clinic time zone '{timeZoneId}' is invalid.");
            }
        }
    }
}