using API.Models.Diets;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class DietController : BaseApiController
    {
        private readonly IDietService _dietService;
         private readonly ILogger<DietController> _logger;   //for debugging use only - can be removed

        public DietController(IDietService dietService ,  ILogger<DietController> logger)
        {
            _dietService = dietService;
            _logger = logger;                                  //for debugging use only - can be removed
        }

       [Authorize(Roles = "admin")]
       [HttpPost(Endpoints.Diets.Create)]
        public async Task<IActionResult> CreateDiet(CreateDietDto createDietDto)
        {
        
        var result = await _dietService.CreateDietAsync(createDietDto);

        _logger.LogInformation("Hello1"); //for debugging use only - can be removed

        if (!ModelState.IsValid)                            //for debugging use only - can be removed
        {
             _logger.LogWarning("Model state is invalid"); //for debugging use only - can be removed
            return BadRequest(ModelState);                 //for debugging use only - can be removed
        }
            
        _logger.LogInformation("Received CreateDiet request with UserDiets: {UserDiets}", createDietDto.UserDiets); //for debugging use only - can be removed


            

            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Diets.Update)]

        public async Task<IActionResult> UpdateDiet(UpdateDietDto updateDietDto)
        {
            var result = await _dietService.UpdateDietAsync(updateDietDto);
            return Ok(result);
        }

        [HttpGet(Endpoints.Diets.GetDiet)]
        
        public async Task<IActionResult> GetDietById(Guid id)
        {
            var result = await _dietService.GetDietByIdAsync(id);
            return Ok(result);
        }

        [HttpGet(Endpoints.Diets.GetAll)]
        public async Task<IActionResult> GetAllDiets()
        {
            var result = await _dietService.GetAllDietsAsync();
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Diets.GetDietByClientId)]
        public async Task<IActionResult> GetDietByClientId(Guid id)
        {
            var result = await _dietService.GetDietByClientIdAsync(id);
            return Ok(result);
        }

        [HttpGet(Endpoints.Diets.GetDietIdByClientId)]
        public async Task<IActionResult> GetDietIdByClientIdAsync(Guid userId)
        {
            var result = await _dietService.GetDietIdByClientIdAsync(userId);
            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Diets.Delete)]
        public async Task<IActionResult> DeleteDiet(Guid id)
        {
            var result = await _dietService.DeleteDietAsync(id);
            return Ok(result);
        }


        [HttpGet(Endpoints.Diets.SearchDiets)] // url example: http://localhost:5207/api/metrics/search?userId=131c296e-75cd-476b-ad9b-a430d986c736&date=2021-09-01&date=2021-09-30
        public async Task<IActionResult> SearchDietsAsync([FromQuery] Guid userId, [FromQuery] DateTime? date)
        {
            var result = await _dietService.SearchDietsAsync(userId, date);
            return Ok(result);
        }

    }
}