namespace PhysioHealthCare.Application.Responses
{
    public class ErrorResponse
    {
        public int StatusCode { get; set; }

        public string Message { get; set; } = string.Empty;

        public string Path { get; set; } = string.Empty;

        public string Method { get; set; } = string.Empty;

        public string TraceId { get; set; } = string.Empty;
    }
}
