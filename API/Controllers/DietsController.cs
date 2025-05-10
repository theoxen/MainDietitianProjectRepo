using API.Models.Diets;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    /// <summary>
    /// Controller responsible for handling diet-related HTTP requests.
    /// Inherits from BaseApiController which likely provides common functionality.
    /// </summary>
    public class DietController : BaseApiController
    {
        // Private field to store the diet service dependency
        private readonly IDietService _dietService;

        /// <summary>
        /// Constructor uses dependency injection to get access to the diet service
        /// </summary>
        public DietController(IDietService dietService)
        {
            _dietService = dietService;
        }

       /// <summary>
       /// Creates a new diet - only accessible by admin users
       /// POST request to the Create endpoint defined in Endpoints.Diets.Create
       /// </summary>
       [Authorize(Roles = "admin")]
       [HttpPost(Endpoints.Diets.Create)]
        public async Task<IActionResult> CreateDiet(CreateDietDto createDietDto)
        {
        
        var result = await _dietService.CreateDietAsync(createDietDto);


            return Ok(result);
        }

        /// <summary>
        /// Updates an existing diet - only accessible by admin users
        /// PUT request to the Update endpoint defined in Endpoints.Diets.Update
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Diets.Update)]
        public async Task<IActionResult> UpdateDiet(UpdateDietDto updateDietDto)
        {
            var result = await _dietService.UpdateDietAsync(updateDietDto);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves a specific diet by its ID
        /// GET request accessible to all authenticated users
        /// </summary>
        [HttpGet(Endpoints.Diets.GetDiet)]
        public async Task<IActionResult> GetDietById(Guid id)
        {
            var result = await _dietService.GetDietByIdAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Gets all available diets in the system
        /// GET request that returns a collection of diets
        /// Uses MapToHttpResponse instead of Ok - likely handles specific response formatting
        /// </summary>
        [HttpGet(Endpoints.Diets.GetAll)]
        public async Task<IActionResult> GetAllDiets()
        {
            var result = await _dietService.GetAllDietsAsync();
            return MapToHttpResponse(result);
        }

        /// <summary>
        /// Retrieves a diet associated with a specific client
        /// GET request that takes a client ID as parameter
        /// </summary>
        [HttpGet(Endpoints.Diets.GetDietByClientId)]
        public async Task<IActionResult> GetDietByClientId(Guid id)
        {
            var result = await _dietService.GetDietByClientIdAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Gets just the diet ID for a specific client
        /// Useful for when you only need the reference ID, not the full diet data
        /// </summary>
        [HttpGet(Endpoints.Diets.GetDietIdByClientId)]
        public async Task<IActionResult> GetDietIdByClientIdAsync(Guid userId)
        {
            var result = await _dietService.GetDietIdByClientIdAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Deletes a diet - restricted to admin users only
        /// DELETE request that requires a diet ID
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Diets.Delete)]
        public async Task<IActionResult> DeleteDiet(Guid id)
        {
            var result = await _dietService.DeleteDietAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Searches for diets based on user ID and optional date criteria
        /// GET request with query parameters (not path parameters)
        /// Example URL: http://localhost:5207/api/metrics/search?userId=131c296e-75cd-476b-ad9b-a430d986c736&date=2021-09-01&date=2021-09-30
        /// </summary>
        [HttpGet(Endpoints.Diets.SearchDiets)]
        public async Task<IActionResult> SearchDietsAsync([FromQuery] Guid userId, [FromQuery] DateTime? date)
        {
            var result = await _dietService.SearchDietsAsync(userId, date);
            return Ok(result);
        }
    }
}