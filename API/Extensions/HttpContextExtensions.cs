using System.Security.Claims;

namespace API.Extensions
{
    public static class HttpContextExtensions
    {
        public static Guid? GetUserId(this HttpContext httpContext)
        {
            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (Guid.TryParse(userId, out var parsedUserId))
            {
                return parsedUserId;
            }

            return null;
        }
    }
}