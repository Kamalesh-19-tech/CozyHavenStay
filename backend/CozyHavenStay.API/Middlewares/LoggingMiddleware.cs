using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CozyHavenStay.API.Middlewares
{
    // LOGGING MIDDLEWARE
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LoggingMiddleware> _logger;

        public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var watch = Stopwatch.StartNew();

            // Log the incoming request
            _logger.LogInformation("Incoming Request: {Method} {Path}", context.Request.Method, context.Request.Path);

            // Continue down the pipeline
            await _next(context);

            watch.Stop();

            // Log the outgoing response
            _logger.LogInformation("Outgoing Response: {StatusCode} completed in {ElapsedMilliseconds}ms", 
                context.Response.StatusCode, watch.ElapsedMilliseconds);
        }
    }
}
