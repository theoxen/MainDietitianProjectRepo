using API.Common;
using API.Models.Recipes;

namespace API.Services.IServices
{
    public interface IRecipeService
    {
        public Task<Result<Empty>> UploadRecipes(RecipesDto recipesDto);
        public Task<Result<RecipesDto>> ViewRecipes(Guid id);
        public Task<Result<Empty>> EditRecipes(RecipesDto recipesDto);
        public Task<Result<List<RecipesDto>>> SearchRecipes(RecipesDto recipesDto);
    }
}