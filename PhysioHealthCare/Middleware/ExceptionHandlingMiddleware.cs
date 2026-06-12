namespace PhysioHealthCare.Middleware
{
    using PhysioHealthCare.Application.Responses;
    using PhysioHealthCare.Application.Exceptions;
    using System.Net;
    using System.Text.Json;

    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                await HandleExceptionAsync(context, exception);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = exception switch
            {
                NotFoundException => HttpStatusCode.NotFound,
                BadRequestException => HttpStatusCode.BadRequest,
                _ => HttpStatusCode.InternalServerError
            };

            if (statusCode == HttpStatusCode.InternalServerError)
            {
                _logger.LogError(
                    exception,
                    "Unhandled exception occurred. Path: {Path}, Method: {Method}, TraceId: {TraceId}",
                    context.Request.Path,
                    context.Request.Method,
                    context.TraceIdentifier);
            }
            else
            {
                _logger.LogWarning(
                    exception,
                    "Handled exception occurred. StatusCode: {StatusCode}, Path: {Path}, Method: {Method}, TraceId: {TraceId}",
                    (int)statusCode,
                    context.Request.Path,
                    context.Request.Method,
                    context.TraceIdentifier);
            }

            var response = new ErrorResponse
            {
                StatusCode = (int)statusCode,
                Message = statusCode == HttpStatusCode.InternalServerError
                ? "An unexpected error occurred."
                : exception.Message,
                Path = context.Request.Path,
                Method = context.Request.Method,
                TraceId = context.TraceIdentifier
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}