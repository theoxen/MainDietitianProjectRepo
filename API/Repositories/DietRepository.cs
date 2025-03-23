using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class DietRepository : IDietRepository
    {
        private readonly DataContext _dataContext;

        public DietRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<Diet?> GetDietByIdAsync(Guid id)
        {
            return await _dataContext.Diets
                .Include(d => d.DietDays)
                .ThenInclude(d => d.DietMeals)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<List<Diet>> GetAllDietsAsync()
        {
            return await _dataContext.Diets
                .Include(d => d.DietDays)
                .ThenInclude(d => d.DietMeals)
                .ToListAsync();
        }

        public async Task<Diet?> GetDietByNameAsync(string name)
        {
            return await _dataContext.Diets
                .FirstOrDefaultAsync(d => d.Name == name);
        }

        public void CreateDiet(Diet diet)
        {
        _dataContext.Diets.Add(diet);
        // var userDiet = new UserDiet { UserId = userId, DietId = diet.Id };
        // _dataContext.UserDiets.Add(userDiet);
        }

        public void UpdateDiet(Diet diet)
        {
            _dataContext.Diets.Update(diet);
        }

        public void DeleteDiet(Diet diet)
        {
            _dataContext.Diets.Remove(diet);
        }

    public void AddUserToDiet(Guid userId, Guid dietId)
    {
    var userDiet = new UserDiet
    {
        UserId = userId,
        DietId = dietId
    };
    _dataContext.UserDiets.Add(userDiet);

    }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}