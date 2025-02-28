using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IRecipeRepository : IBaseRepository
    {
        //Get Recipe By Id Works is for the view recipe
        public Task<Recipe?> GetRecipeByIdAsync(Guid id);
        //Create Recipe Works
        public void CreateRecipe(Recipe recipe);

        public void DeleteRecipe(Recipe recipe);

        //Search Recipes finished needs to be tested
        public Task<List<Recipe>> SearchRecipes(string searchTerm);

    }
}
