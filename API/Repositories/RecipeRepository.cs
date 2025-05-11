using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    // Repository class that handles all database operations for recipes
    // Implements IRecipeRepository interface for dependency injection
    public class RecipeRepository : IRecipeRepository
    {
        // Database context instance for Entity Framework operations
        // Injected through constructor for database access
        private readonly DataContext _context;

        // Constructor using dependency injection pattern
        // DataContext is automatically provided by the DI container
        public RecipeRepository(DataContext context)
        {
            _context = context;
        }

        // Asynchronously retrieves a single recipe by its unique identifier
        // Returns null if no recipe is found with the given id
        // Used in view, edit, and delete operations
        public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
        {
            return await _context.Recipes.FirstOrDefaultAsync(x => x.Id == id);
        }

        // Adds a new recipe to the database context
        // Note: Changes aren't saved until Commit() is called
        // Used when creating new recipes in the system
        public void CreateRecipe(Recipe recipe)
        {
            _context.Recipes.Add(recipe);
        }

        // Removes a recipe from the database context
        // Note: Changes aren't saved until Commit() is called
        // Used for deleting recipes from the system
        public void DeleteRecipe(Recipe recipe)
        {
            _context.Recipes.Remove(recipe);
        }

        // Searches for recipes by name using Entity Framework
        // Returns a list of matching recipes asynchronously
        // TODO: Could be enhanced to also search in ingredients
        public async Task<List<Recipe>> SearchRecipes(string searchTerm)
        {
            return await _context.Recipes
                .Where(r => r.Name.Contains(searchTerm))//search by name or ingredients
                .ToListAsync();
        }

        // Retrieves all recipes from the database
        // Used for displaying the complete recipe catalog
        // Returns a list of all available recipes
        public async Task<List<Recipe>> GetAllRecipes()
        {
            return await _context.Recipes.ToListAsync();
        }

        // Saves all pending changes in the context to the database
        // Returns true if any changes were saved successfully
        // Returns false if no changes were pending or save failed
        public async Task<bool> Commit()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}