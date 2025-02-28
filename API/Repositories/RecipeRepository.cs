using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class RecipeRepository : IRecipeRepository
    {
        private readonly DataContext _context;

        public RecipeRepository(DataContext context)
        {
            _context = context;
        }

        
        // GetRecipeByIdAsync method is used to get a recipe by its id
        public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
        {
            return await _context.Recipes.FirstOrDefaultAsync(x => x.Id == id);
        }


        // CreateRecipe method is used to add a new recipe to the database
        public void CreateRecipe(Recipe recipe)
        {
            _context.Recipes.Add(recipe);
        }


        public void DeleteRecipe(Recipe recipe)
        {
            _context.Recipes.Remove(recipe);
        }


        // SearchRecipes method is used to search for recipes by name or ingredients
        public async Task<List<Recipe>> SearchRecipes(string searchTerm)
        {
            return await _context.Recipes
                .Where(r => r.Name.Contains(searchTerm))//search by name or ingredients
                .ToListAsync();
        }


        // Commit method is to save all the changes of the context to the database
        public async Task<bool> Commit()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}