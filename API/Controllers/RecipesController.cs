using API.Models.Recipes;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    // Controller that handles all recipe-related HTTP endpoints
    // Inherits from BaseApiController for common controller functionality
    public class RecipesController : BaseApiController
    {
        // Dependency injection of recipe service
        // This service contains all the business logic for recipe operations
        private readonly IRecipeService _recipeService;

        // Constructor initializes the recipe service
        public RecipesController(IRecipeService recipeService)
        {
            _recipeService = recipeService;
        }

        // POST endpoint for creating new recipes
        // Only administrators can create recipes
        // Takes CreateRecipeDto as input containing recipe details
        [Authorize(Roles = "admin")]
        [HttpPost(Endpoints.Recipes.Upload)]
        public async Task<IActionResult> UploadRecipes(CreateRecipeDto createRecipeDto)
        {
            var result = await _recipeService.UploadRecipes(createRecipeDto);
            return MapToHttpResponse(result);
        }

        // GET endpoint to retrieve a specific recipe by ID
        // Both admins and clients can view recipes
        // Returns detailed information about a single recipe
        [Authorize(Roles = "admin, client")]
        [HttpGet(Endpoints.Recipes.View)]
        public async Task<IActionResult> ViewRecipes(Guid id)
        {
            var result = await _recipeService.ViewRecipes(id);
            return MapToHttpResponse(result);
        }

        // GET endpoint to retrieve all available recipes
        // Both admins and clients can access this endpoint
        // Returns a list of all recipes in the system
        [Authorize(Roles = "admin, client")]
        [HttpGet(Endpoints.Recipes.ViewAll)]
        public async Task<IActionResult> ViewAllRecipes()
        {
            var result = await _recipeService.ViewAllRecipes();
            return MapToHttpResponse(result);
        }
        
        // PUT endpoint for updating existing recipes
        // Only administrators can modify recipes
        // Takes UpdateRecipeDto containing updated recipe information
        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Recipes.Edit)]
        public async Task<IActionResult> EditRecipes(UpdateRecipeDto updateRecipeDto)
        {
            var result = await _recipeService.EditRecipe(updateRecipeDto);
            return MapToHttpResponse(result);
        }

        // GET endpoint for searching recipes
        // No authorization required - public endpoint
        // Accepts optional search term to filter recipes
        [HttpGet(Endpoints.Recipes.Search)]
        public async Task<IActionResult> SearchRecipes([FromQuery] string? searchTerm)
        {
            var result = await _recipeService.SearchRecipes(searchTerm);
            return MapToHttpResponse(result);
        }

        // DELETE endpoint for removing recipes from the system
        // Only administrators can delete recipes
        // Takes recipe ID as parameter
        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Recipes.Delete)]
        public async Task<IActionResult> DeleteRecipes(Guid id)
        {
            var result = await _recipeService.DeleteRecipes(id);
            return MapToHttpResponse(result);
        }
    }
}