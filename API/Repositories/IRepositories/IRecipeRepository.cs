using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IRecipeRepository : IBaseRepository
    {
        Task<Recipe?> GetRecipeByIdAsync(Guid id);
    }
}