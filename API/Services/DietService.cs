using API.Common;
using API.Data;
using API.Models.Diets;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Identity;


namespace API.Services
{
    public class DietService : IDietService
    {
       private readonly IDietRepository _dietRepository;

        public DietService(IDietRepository dietRepository)
        {
            _dietRepository = dietRepository;
        }

        public async Task<Result<DietDayDto>> AddDayAsync(DietDayDto dietDayDto)
        {
            var dietDay = new DietDay
            {
                Id = dietDayDto.Id,
                DayName = dietDayDto.DayName,
                DietId = dietDayDto.DietID
            };

            _dietRepository.AddDay(dietDay);

            if (await _dietRepository.Commit())
            {
                return Result<DietDayDto>.Ok(dietDayDto);
            }

            return Result<DietDayDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedAddingDay",
                    Message = "Failed to add day"
                }
            });   
            
            }

        public async Task<Result<Empty>> DeleteDayAsync(Guid dayId)
        {
            var dietDay = await _dietRepository.GetDayAsync(dayId);

            if (dietDay == null)
            {
                return Result<Empty>.NotFound();
            }

            _dietRepository.DeleteDay(dietDay);

            if (await _dietRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedDeletingDay",
                    Message = "Failed to delete day"
                }
            });
        }

        public async Task<Result<DietMealDto>> AddMealAsync(DietMealDto dietMealDto)
        {
            var dietMeal = new DietMeal
            {
                Id = dietMealDto.MealID,
                MealType = dietMealDto.MealType,
                Meal = dietMealDto.Meal,
                DietDayId = dietMealDto.DietID,
                DietDay = dietMealDto.DietDay
            };

            _dietRepository.AddMeal(dietMeal);

            if (await _dietRepository.Commit())
            {
                return Result<DietMealDto>.Ok(dietMealDto);
            }

            return Result<DietMealDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedCreatingMeal",
                    Message = "Failed to create meal"
                }
            });
        }

        public async Task<Result<Empty>> DeleteMealAsync(Guid mealId)
        {
            var dietMeal = await _dietRepository.GetMealAsync(mealId);

            if (dietMeal == null)
            {
                return Result<Empty>.NotFound();
            }

            _dietRepository.DeleteMeal(dietMeal);

            if (await _dietRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedDeletingMeal",
                    Message = "Failed to delete meal"
                }
            });
        }

        public async Task<Result<DietDto>> GetDietByUserIdAsync(Guid userId, Guid dietId)
        {
            var diet = await _dietRepository.GetDietByUserIdAsync(userId, dietId);

            if (diet == null)
            {
                return Result<DietDto>.NotFound();
            }

            var dietDto = new DietDto
            {
                Id = diet.Id,
                Name = diet.Name,
                IsTemplate = diet.IsTemplate,
                DateCreated = diet.DateCreated
            };

            return Result<DietDto>.Ok(dietDto);
        }

    }
}