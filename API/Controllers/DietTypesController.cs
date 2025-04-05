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

        // [Authorize(Roles = "admin")] I think this shouldnt be here because we are calling this endpoint even when an admin is NOT logged in
        [HttpGet(Endpoints.DietTypes.GetAllDietTypes)]
        public async Task<IActionResult> GetAllDietTypes()
        {
            var result = await dietTypesService.GetAllDietTypesAsync();

            return MapToHttpResponse(result);
        }
    }
}
