using API.Common;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class DietTypesController : BaseApiController
    {
        private readonly IDietTypesService dietTypesService;

        public DietTypesController(IDietTypesService dietTypesService)
        {
            this.dietTypesService = dietTypesService;
        }

        // [Authorize(Roles = "admin")] 
        [HttpGet(Endpoints.DietTypes.GetAllDietTypes)]
        public async Task<IActionResult> GetAllDietTypes()
        {
            var result = await dietTypesService.GetAllDietTypesAsync();

            return MapToHttpResponse(result);
        }
    }
}
