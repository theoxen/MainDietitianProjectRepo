using API.Common;
using API.Data;
using API.Helpers;
using API.Models.Recipes;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace API.Services
{
    // Service class that handles all recipe-related operations like CRUD and search
    public class RecipeService : IRecipeService
    {
        // Dependency injection of recipe repository for data access
        private readonly IRecipeRepository _recipeRepository;

        public RecipeService(IRecipeRepository recipeRepository)
        {
            _recipeRepository = recipeRepository;
        }
     
/////////////////////////////////////////////////////////////////////Edit Recipes///////////////////////////////////////////////////////////////////////
        // Handles recipe updates, validates changes, and persists modifications
        public async Task<Result<RecipesDto>> EditRecipe(UpdateRecipeDto updateRecipeDto)
        {
            // Retrieve existing recipe and verify it exists
            var recipe = await _recipeRepository.GetRecipeByIdAsync(updateRecipeDto.Id);
            if (recipe == null)
            {
                return Result<RecipesDto>.NotFound();
            }

            // Use helper function to detect if any fields have actually changed
            bool changeDetected = UpdatingEntitiesHelperFunction.ChangeInFieldsDetected(recipe, updateRecipeDto);

            // If no changes detected, return existing recipe data
            if (!changeDetected)
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

            // Update recipe properties with new values
            recipe.Name = updateRecipeDto.Name;
            recipe.Ingredients = updateRecipeDto.Ingredients;
            recipe.Directions = updateRecipeDto.Directions;
            recipe.Protein = updateRecipeDto.Protein;
            recipe.Carbs = updateRecipeDto.Carbs;
            recipe.Fat = updateRecipeDto.Fat;
            recipe.Calories = updateRecipeDto.Calories;

            // Attempt to save changes and return appropriate response
            if (await _recipeRepository.Commit())
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
            // Return error if save fails
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
        // Handles recipe search functionality by name or ingredients
        // Returns all recipes if search term is empty
        public async Task<Result<List<RecipesDto>>> SearchRecipes(string? searchTerm)
        {
            // Handle empty search case - returns all recipes
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
            
            // Perform search based on search term
            var recipes = await _recipeRepository.SearchRecipes(searchTerm);

            // Handle no results found
            if (recipes == null)
            {
                return Result<List<RecipesDto>>.NotFound();
            }

            // Map found recipes to DTOs for client response
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
        // Creates new recipe in the system
        // Validates and stores recipe data from client
        public async Task<Result<RecipesDto>> UploadRecipes(CreateRecipeDto createRecipeDto)
        {
            // Create new recipe entity from DTO data
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

            // Add recipe to repository
            _recipeRepository.CreateRecipe(recipe);

            // Attempt to save and return appropriate response
            if (await _recipeRepository.Commit())
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
        // Retrieves a single recipe by its ID with full details
        public async Task<Result<RecipesDto>> ViewRecipes(Guid id)
        {
            // Attempt to find recipe by ID
            var recipe = await _recipeRepository.GetRecipeByIdAsync(id);

            if (recipe == null)
            {
                return Result<RecipesDto>.NotFound();
            }

            // Map recipe data to DTO for client response
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

/////////////////////////////////////////////////////////////////////Delete Recipes///////////////////////////////////////////////////////////////////////
        // Removes a recipe from the system by ID
        public async Task<Result<Empty>> DeleteRecipes(Guid id)
        {
            // Verify recipe exists before attempting delete
            var recipe = await _recipeRepository.GetRecipeByIdAsync(id);

            if (recipe == null)
            {
                return Result<Empty>.NotFound();
            }

            // Perform delete operation
            _recipeRepository.DeleteRecipe(recipe);

            // Attempt to save changes and return appropriate response
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
        // Retrieves all recipes in the system
        // Used for displaying complete recipe listing
        public async Task<Result<List<RecipesDto>>> ViewAllRecipes()
        {
            // Get all recipes from repository
            List<Recipe> recipes = await _recipeRepository.GetAllRecipes();
            
            // Map all recipes to DTOs for client response
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