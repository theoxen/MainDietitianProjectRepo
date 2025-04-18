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

        public async Task<Diet?> GetDietByClientIdAsync(Guid userId)
        {
            return await _dataContext.Diets
                .Include(d => d.DietDays)
                .ThenInclude(d => d.DietMeals)
                .FirstOrDefaultAsync();
        }

        public async Task<Guid> GetDietIdByClientIdAsync(Guid userId)
        {
            return await _dataContext.UserDiets
                .Where(d => d.UserId == userId)
                .Select(d => d.DietId)
                .FirstOrDefaultAsync();
        }

public async Task<List<Diet>> SearchDietsAsync(Guid userId, DateTime? date)
        {
            var query = _dataContext.Diets.AsQueryable();

            if (userId != Guid.Empty)
            {
                query = query.Where(m => m.UserDiets.Any(ud => ud.UserId == userId));
            }

            if (date.HasValue && date.Value != DateTime.MinValue)
            {
                query = query.Where(m => m.DateCreated.Date == date.Value.Date);
            }

            return await query.ToListAsync();
        }






    }
}