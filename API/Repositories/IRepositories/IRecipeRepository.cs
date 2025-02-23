using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IRecipeRepository
    {
        Task<Recipe?> GetRecipeByIdAsync(Guid id);
    }
}