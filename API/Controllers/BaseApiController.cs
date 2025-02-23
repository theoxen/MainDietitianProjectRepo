using API.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        protected IActionResult MapToHttpResponse<T>(Result<T> result) // Can be used to the other controllers inheriting the baseapicontroller.
        {
            return result.ResultType switch
            {
                ResultTypes.Ok => Ok(result.Data),
                ResultTypes.NotFound => NotFound(),
                ResultTypes.BadRequest => BadRequest(result.ResultErrors),
                ResultTypes.Unauthorized => Unauthorized(),
                ResultTypes.InternalServerError => StatusCode(StatusCodes.Status500InternalServerError),
                _ => BadRequest()
            };
        }
    }
}
