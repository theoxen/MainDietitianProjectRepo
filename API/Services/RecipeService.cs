using API.Common;
using API.Data;
using API.Models.Recipes;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace API.Services
{
    public class RecipeService : IRecipeService
    {
        private readonly IRecipeRepository _recipeRepository;

        public RecipeService(IRecipeRepository recipeRepository)
        {
            _recipeRepository = recipeRepository;
        }
     
        public Task<Result<Empty>> EditRecipes(RecipesDto recipesDto)
        {
            throw new NotImplementedException();
        }

        public Task<Result<List<RecipesDto>>> SearchRecipes(RecipesDto recipesDto)
        {
            throw new NotImplementedException();
        }

        public Task<Result<Empty>> UploadRecipes(RecipesDto recipesDto)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<RecipesDto>> ViewRecipes(Guid id)
        {
            var recipe = await _recipeRepository.GetRecipeByIdAsync(id);

            if (recipe == null)
            {
                return Result<RecipesDto>.NotFound();
            }

            var recipeDto = new RecipesDto
            {
                Id = recipe.Id,
                Name = recipe.Name,
                Ingredients = recipe.Ingredients,
                Directions = recipe.Directions,
                Protein = recipe.Protein,
                Carbs = recipe.Carbs,
                Fat = recipe.Fat,
                Calories = recipe.Calories
            };

            return Result<RecipesDto>.Ok(recipeDto);

        }
    }
}