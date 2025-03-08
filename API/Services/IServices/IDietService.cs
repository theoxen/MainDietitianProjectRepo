using API.Common;
using API.Models.Diets;

namespace API.Services.IServices
{
    public interface IDietService
    {
 // Methods for DietDay
        Task<Result<DietDayDto>> AddDayAsync(DietDayDto dietDayDto);
        Task<Result<Empty>> DeleteDayAsync(Guid dayId);

        // Methods for DietMeal
        Task<Result<DietMealDto>> AddMealAsync(DietMealDto dietMealDto);
        Task<Result<Empty>> DeleteMealAsync(Guid mealId);

        // Method to get diet by userId and dietId
        Task<Result<DietDto>> GetDietByUserIdAsync(Guid userId, Guid dietId);
    }
}