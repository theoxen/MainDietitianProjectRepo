using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IDietRepository : IBaseRepository
    {
        Task<Diet?> GetDietByIdAsync(Guid id);
        Task<List<Diet>> GetAllDietsAsync();
        Task<Diet?> GetDietByNameAsync(string name);
        void CreateDiet(Diet diet);
        void UpdateDiet(Diet diet);
        void DeleteDiet(Diet diet);

        void AddUserToDiet(Guid userId, Guid dietId);

        
    }
}