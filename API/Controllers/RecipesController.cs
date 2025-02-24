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
        public async Task<IActionResult> UploadRecipes(RecipesDto recipesDto)
        {
            var result = await _recipeService.UploadRecipes(recipesDto);
            return MapToHttpResponse(result);
        }

        // View Recipes => Get
        [HttpGet("api/recipes/view")] // GET MIGHT REQUIRE /{id} IN THE URL PATH
        public async Task<IActionResult> ViewRecipes(Guid id)
        {
            var result = await _recipeService.ViewRecipes(id);
            return MapToHttpResponse(result);
        }
        
        // Edit Recipes => post
        [HttpPost("api/recipes/edit")]
        public async Task<IActionResult> EditRecipes(RecipesDto recipesDto)
        {
            var result = await _recipeService.EditRecipes(recipesDto);
            return MapToHttpResponse(result);
        }


        // Search Recipes => Post
        [HttpPost("api/recipes/search")]
        public async Task<IActionResult> SearchRecipes(RecipesDto recipesDto)
        {
            var result = await _recipeService.SearchRecipes(recipesDto);
            return MapToHttpResponse(result);
        }
    }
}