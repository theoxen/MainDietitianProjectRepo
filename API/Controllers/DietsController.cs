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

        // [Authorize(Roles = "admin")]
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

        // [Authorize(Roles = "admin")]
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
            return Ok(result);
        }

        //Remove // [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Diets.Delete)]
        public async Task<IActionResult> DeleteDiet(Guid id)
        {
            var result = await _dietService.DeleteDietAsync(id);
            return Ok(result);
        }
    }
}