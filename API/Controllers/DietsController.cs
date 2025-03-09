using API.Models.Diets;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using API.Data;
using API.Common;
using System;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DietsController : BaseApiController
    {
        private readonly IDietService _dietService;

        public DietsController(IDietService dietService)
        {
            _dietService = dietService;
        }

        [HttpPost("days")]
        public async Task<IActionResult> AddDay([FromBody] DietDayDto dietDayDto)
        {
            var result = await _dietService.AddDayAsync(dietDayDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete("days/{dayId}")]
        public async Task<IActionResult> DeleteDay(Guid dayId)
        {
            var result = await _dietService.DeleteDayAsync(dayId);
            return MapToHttpResponse(result);
        }

        [HttpPost("meals")]
        public async Task<IActionResult> AddMeal([FromBody] DietMealDto dietMealDto)
        {
            var result = await _dietService.AddMealAsync(dietMealDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete("meals/{mealId}")]
        public async Task<IActionResult> DeleteMeal(Guid mealId)
        {
            var result = await _dietService.DeleteMealAsync(mealId);
            return MapToHttpResponse(result);
        }

        [HttpGet("{userId}/{dietId}")]
        public async Task<IActionResult> GetDietByUserId(Guid userId, Guid dietId)
        {
            var result = await _dietService.GetDietByUserIdAsync(userId, dietId);
            return MapToHttpResponse(result);
        }
    }
}