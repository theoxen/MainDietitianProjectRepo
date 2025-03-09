using API.Common;
using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using API.Models.Diets;
namespace API.Repositories
{
    public class DietRepository : IDietRepository
    {
 private readonly DataContext _dataContext;

        public DietRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public void AddDay(DietDay dietDay)
        {
            _dataContext.DietDays.Add(dietDay);
        }

        public void DeleteDay(DietDay dietDay)
        {
            _dataContext.DietDays.Remove(dietDay);
        }

        public async Task<DietDay?> GetDayAsync(Guid dayId)
        {
            return await _dataContext.DietDays.FirstOrDefaultAsync(x => x.Id == dayId);
        }

        public void AddMeal(DietMeal dietMeal)
        {
            _dataContext.DietMeals.Add(dietMeal);
        }

        public void DeleteMeal(DietMeal dietMeal)
        {
            _dataContext.DietMeals.Remove(dietMeal);
        }

        public async Task<DietMeal?> GetMealAsync(Guid mealId)
        {
            return await _dataContext.DietMeals.FirstOrDefaultAsync(x => x.Id == mealId);
        }

        public async Task<Diet?> GetDietByUserIdAsync(Guid userId, Guid dietId)
        {
            return await _dataContext.Diets
                .Include(d => d.DietDays)
                .ThenInclude(dd => dd.DietMeals)
                .FirstOrDefaultAsync(d => d.Id == dietId && d.UserDiets.Any(ud => ud.UserId == userId));
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }

    }
}