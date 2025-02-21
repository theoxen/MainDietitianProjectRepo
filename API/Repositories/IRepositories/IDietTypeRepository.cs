using API.Data;

namespace API.Repositories.IRepositories;

public interface IDietTypeRepository
{
    public Task<DietType?> GetDietTypeByIdAsync(Guid id);

    Task<List<DietType>> GetAllDietTypesAsync();
}
