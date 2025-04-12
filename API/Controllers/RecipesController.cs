using API.Models.Recipes;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "admin")]
        [HttpPost(Endpoints.Recipes.Upload)]
        public async Task<IActionResult> UploadRecipes(CreateRecipeDto createRecipeDto)
        {
            var result = await _recipeService.UploadRecipes(createRecipeDto);
            return MapToHttpResponse(result);
        }

        // View Recipes => Get
        [HttpGet(Endpoints.Recipes.View)] // GET MIGHT REQUIRE /{id} IN THE URL PATH
        public async Task<IActionResult> ViewRecipes(Guid id)
        {
            var result = await _recipeService.ViewRecipes(id);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Recipes.ViewAll)]
        public async Task<IActionResult> ViewAllRecipes()
        {
            var result = await _recipeService.ViewAllRecipes();
            return MapToHttpResponse(result);
        }
        
        // Edit Recipes => Put
        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Recipes.Edit)] // POST MIGHT REQUIRE /{id} IN THE URL PATH
        public async Task<IActionResult> EditRecipes(UpdateRecipeDto updateRecipeDto)
        {
            var result = await _recipeService.EditRecipe(updateRecipeDto);
            return MapToHttpResponse(result);
        }

        // Search Recipes => Get
        [HttpGet(Endpoints.Recipes.Search)]
        public async Task<IActionResult> SearchRecipes([FromQuery] string? searchTerm)
        {
            var result = await _recipeService.SearchRecipes(searchTerm);
            return MapToHttpResponse(result);
        }


        // Delete Recipes => Delete
        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Recipes.Delete)] // POST MIGHT REQUIRE /{id} IN THE URL PATH
        public async Task<IActionResult> DeleteRecipes(Guid id)
        {
            var result = await _recipeService.DeleteRecipes(id);
            return MapToHttpResponse(result);
        }
    }
}