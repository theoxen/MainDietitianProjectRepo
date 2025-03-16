using API.Common;
using API.Data;
using API.Helpers;
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
     
/////////////////////////////////////////////////////////////////////Edit Recipes///////////////////////////////////////////////////////////////////////
        public async Task<Result<RecipesDto>> EditRecipe(UpdateRecipeDto updateRecipeDto)
        {
            var recipe = await _recipeRepository.GetRecipeByIdAsync(updateRecipeDto.Id); // Get the recipe by its id
            if (recipe == null) // If the recipe is not found
            {
                return Result<RecipesDto>.NotFound();
            }

            bool changeDetected = UpdatingEntitiesHelperFunction.ChangeInFieldsDetected(recipe, updateRecipeDto); // Check if any changes are detected

            if (!changeDetected) // If no changes are detected
            {
                return Result<RecipesDto>.Ok(new RecipesDto
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Ingredients = recipe.Ingredients,
                    Directions = recipe.Directions,
                    DateCreated = recipe.DateCreated,
                    Protein = recipe.Protein,
                    Carbs = recipe.Carbs,
                    Fat = recipe.Fat,
                    Calories = recipe.Calories
                });
            }

            recipe.Name = updateRecipeDto.Name;
            recipe.Ingredients = updateRecipeDto.Ingredients;
            recipe.Directions = updateRecipeDto.Directions;
            recipe.Protein = updateRecipeDto.Protein;
            recipe.Carbs = updateRecipeDto.Carbs;
            recipe.Fat = updateRecipeDto.Fat;
            recipe.Calories = updateRecipeDto.Calories;

            if (await _recipeRepository.Commit()) // Committing the changes to the database
            {
                return Result<RecipesDto>.Ok(new RecipesDto
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Ingredients = recipe.Ingredients,
                    Directions = recipe.Directions,
                    DateCreated = recipe.DateCreated,
                    Protein = recipe.Protein,
                    Carbs = recipe.Carbs,
                    Fat = recipe.Fat,
                    Calories = recipe.Calories
                });
            }
            return Result<RecipesDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToEditRecipe",
                    Message = "Failed to edit recipe"
                }
            });
        }

/////////////////////////////////////////////////////////////////////Search Recipes///////////////////////////////////////////////////////////////////////
        // This method is used to search for recipes by name or ingredients

        public async Task<Result<List<RecipesDto>>> SearchRecipes(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                // Optional: Return all recipes instead of an error
                var allRecipes = await _recipeRepository.GetAllRecipes();
                return Result<List<RecipesDto>>.Ok(allRecipes.Select(recipe => new RecipesDto
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Ingredients = recipe.Ingredients,
                    Directions = recipe.Directions,
                    DateCreated = recipe.DateCreated,
                    Protein = recipe.Protein,
                    Carbs = recipe.Carbs,
                    Fat = recipe.Fat,
                    Calories = recipe.Calories
                }).ToList());
            }
            
            var recipes = await _recipeRepository.SearchRecipes(searchTerm);

            if (recipes == null)
            {
                return Result<List<RecipesDto>>.NotFound();
            }

            var recipesDto = recipes.Select(recipe => new RecipesDto
            {
                Id = recipe.Id,
                Name = recipe.Name,
                Ingredients = recipe.Ingredients,
                Directions = recipe.Directions,
                DateCreated = recipe.DateCreated,
                Protein = recipe.Protein,
                Carbs = recipe.Carbs,
                Fat = recipe.Fat,
                Calories = recipe.Calories
            }).ToList();

            return Result<List<RecipesDto>>.Ok(recipesDto);
        }

/////////////////////////////////////////////////////////////////////Upload Recipes///////////////////////////////////////////////////////////////////////

        // This method is used to upload a recipe to the database
        // It takes a CreateRecipeDto object as a parameter
        public async Task<Result<RecipesDto>> UploadRecipes(CreateRecipeDto createRecipeDto)
        {
            var recipe = new Recipe
            {
                Name = createRecipeDto.Name,
                Ingredients = createRecipeDto.Ingredients,
                Directions = createRecipeDto.Directions,
                Protein = createRecipeDto.Protein,
                Carbs = createRecipeDto.Carbs,
                Fat = createRecipeDto.Fat,
                Calories = createRecipeDto.Calories
            };

            _recipeRepository.CreateRecipe(recipe);

            if  (await _recipeRepository.Commit())
            {
                return Result<RecipesDto>.Ok(new RecipesDto
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Ingredients = recipe.Ingredients,
                    Directions = recipe.Directions,
                    DateCreated = recipe.DateCreated,
                    Protein = recipe.Protein,
                    Carbs = recipe.Carbs,
                    Fat = recipe.Fat,
                    Calories = recipe.Calories
                });
            }

            return Result<RecipesDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToUploadRecipe",
                    Message = "Failed to upload recipe"
                }
            });
        }

/////////////////////////////////////////////////////////////////////View Recipes///////////////////////////////////////////////////////////////////////
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
                DateCreated = recipe.DateCreated,
                Protein = recipe.Protein,
                Carbs = recipe.Carbs,
                Fat = recipe.Fat,
                Calories = recipe.Calories
            };

            return Result<RecipesDto>.Ok(recipeDto);

        }

/// ///////////////////////////////////////////////////////////////////////Delete Recipes/// ///////////////////////////////////////////////////////////////////////
        public async Task<Result<Empty>> DeleteRecipes(Guid id)
        {
            var recipe = await _recipeRepository.GetRecipeByIdAsync(id);

            if (recipe == null)
            {
                return Result<Empty>.NotFound();
            }

            _recipeRepository.DeleteRecipe(recipe);

            if (await _recipeRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToDeleteRecipe",
                    Message = "Failed to delete recipe"
                }
            });
        }



/////////////////////////////////////////////////////////////////////View All Recipes///////////////////////////////////////////////////////////////////////
        public async Task<Result<List<RecipesDto>>> ViewAllRecipes()
        {
            List<Recipe> recipes = await _recipeRepository.GetAllRecipes();
            List<RecipesDto> recipesDto = recipes.Select(recipe => new RecipesDto
            {
                Id = recipe.Id,
                Name = recipe.Name,
                Ingredients = recipe.Ingredients,
                Directions = recipe.Directions,
                DateCreated = recipe.DateCreated,
                Protein = recipe.Protein,
                Carbs = recipe.Carbs,
                Fat = recipe.Fat,
                Calories = recipe.Calories
            }).ToList();

            return Result<List<RecipesDto>>.Ok(recipesDto);
        }
    }
}