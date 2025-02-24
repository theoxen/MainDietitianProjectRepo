using API.Data;

namespace API.Repositories.IRepositories;

public interface IDietTypeRepository : IBaseRepository
{
    public Task<DietType?> GetDietTypeByIdAsync(Guid id);

    Task<List<DietType>> GetAllDietTypesAsync();
}
