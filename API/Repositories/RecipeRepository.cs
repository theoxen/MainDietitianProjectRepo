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

        public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
        {
            return await _context.Recipes.FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task<bool> Commit()
        {
            return await _context.SaveChangesAsync() > 0;
        }

    }
}