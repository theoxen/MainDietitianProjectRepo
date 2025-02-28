using API.Data;
using API.Models.Recipes;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    
    public class RecipesController : BaseApiController //BaseApiController xreiazete "den ksero giati"
    {

        private readonly IRecipeService _recipeService;

        public RecipesController(IRecipeService recipeService)
        {
            _recipeService = recipeService;
        }

        // Uplode recipes => Post
        [HttpPost("api/recipes/upload")]
        public async Task<IActionResult> UploadRecipes(CreateRecipeDto createRecipeDto)
        {
            var result = await _recipeService.UploadRecipes(createRecipeDto);
            return MapToHttpResponse(result);
        }

        // View Recipes => Get
        [HttpGet("api/recipes/view/{id}")] // GET MIGHT REQUIRE /{id} IN THE URL PATH
        public async Task<IActionResult> ViewRecipes(Guid id)
        {
            var result = await _recipeService.ViewRecipes(id);
            return MapToHttpResponse(result);
        }
        
        // Edit Recipes => post
        [HttpPut("api/recipes/edit")] // POST MIGHT REQUIRE /{id} IN THE URL PATH
        public async Task<IActionResult> EditRecipes(UpdateRecipeDto updateRecipeDto)
        {
            var result = await _recipeService.EditRecipe(updateRecipeDto);
            return MapToHttpResponse(result);
        }

        // Search Recipes => Post
        [HttpGet("api/recipes/search")]
        public async Task<IActionResult> SearchRecipes([FromQuery] string searchTerm)
        {
            var result = await _recipeService.SearchRecipes(searchTerm);
            return MapToHttpResponse(result);
        }


        // Delete Recipes => Post
        [HttpDelete("api/recipes/delete/{id}")] // POST MIGHT REQUIRE /{id} IN THE URL PATH
        public async Task<IActionResult> DeleteRecipes(Guid id)
        {
            var result = await _recipeService.DeleteRecipes(id);
            return MapToHttpResponse(result);
        }
    }
}