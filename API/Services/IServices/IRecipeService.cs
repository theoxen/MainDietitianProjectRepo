using API.Common;
using API.Models.Recipes;

namespace API.Services.IServices
{
    public interface IRecipeService
    {
        public Task<Result<RecipesDto>> UploadRecipes(CreateRecipeDto createRecipeDto);
        public Task<Result<RecipesDto>> ViewRecipes(Guid id);
        public Task<Result<RecipesDto>> EditRecipe(UpdateRecipeDto updateRecipeDto);
        public Task<Result<List<RecipesDto>>> SearchRecipes(string searchTerm);
        public Task<Result<Empty>> DeleteRecipes(Guid id);
    }
}