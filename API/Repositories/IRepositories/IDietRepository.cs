using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IDietRepository : IBaseRepository
    {
        // Methods for DietDay
        void AddDay(DietDay dietDay);
        void DeleteDay(DietDay dietDay);
        Task<DietDay?> GetDayAsync(Guid dayId);

        // Methods for DietMeal
        void AddMeal(DietMeal dietMeal);
        void DeleteMeal(DietMeal dietMeal);
        Task<DietMeal?> GetMealAsync(Guid mealId);

        // Method to get diet by userId and dietId
        Task<Diet?> GetDietByUserIdAsync(Guid userId, Guid dietId);
    }
}