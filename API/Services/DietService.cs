using API.Data;
using API.Common;
using API.Models.Diets;
using API.Repositories.IRepositories;
using API.Services.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace API.Services
{
    public class DietService : IDietService
    {
        private readonly IDietRepository _dietRepository;
        private readonly ILogger<DietService> _logger;  //for debugging use only - can be removed


        public DietService(IDietRepository dietRepository, ILogger<DietService> logger) //for debugging use only - can be removed
        {
            _dietRepository = dietRepository;   
            _logger = logger;                   //for debugging use only - can be removed
        }

        public async Task<Result<DietDto>> CreateDietAsync(CreateDietDto createDietDto)
        {
          //  _logger.LogInformation("Creating diet with Name: {Name}", createDietDto.Name);  //for debugging use only - can be removed


            // if (string.IsNullOrEmpty(createDietDto.Name))
            // {
            //     _logger.LogError("Diet name is null or empty"); //for debugging use only - can be removed

            //     throw new ArgumentException("Diet name cannot be null or empty", nameof(createDietDto.Name));
            // }
            
            
            var existingDiet = await _dietRepository.GetDietByNameAsync(createDietDto.Name);
            if (existingDiet != null)
            {
                return Result<DietDto>.BadRequest(new List<ResultError>
                {
                    new ResultError
                    {
                        Identifier = "DietAlreadyExists",
                        Message = "A diet with the same name already exists"
                    }
                });
            }

            var diet = new Diet
            {
                Name = createDietDto.Name,
                IsTemplate = createDietDto.IsTemplate,
                DietDays = createDietDto.Days.Select(d => new DietDay
                {
                    DayName = d.DayName,
                    DietMeals = d.Meals.Select(m => new DietMeal
                    {
                        Meal = m.Meal,
                        MealType = m.Type
                    }).ToList()
                }).ToList()
            };

            _dietRepository.CreateDiet(diet);

            if (await _dietRepository.Commit())
            {
                return Result<DietDto>.Ok(new DietDto
                {
                    Id = diet.Id,
                    Name = diet.Name,
                    IsTemplate = diet.IsTemplate,
                    DateCreated = diet.DateCreated,
                    Days = createDietDto.Days
                });
            }

            return Result<DietDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToCreateDiet",
                    Message = "Failed to create diet"
                }
            });
        }

        public async Task<Result<DietDto>> UpdateDietAsync(UpdateDietDto updateDietDto)
        {
            var diet = await _dietRepository.GetDietByIdAsync(updateDietDto.Id);
            if (diet == null)
            {
                return Result<DietDto>.NotFound();
            }

            diet.Name = updateDietDto.Name;
            diet.IsTemplate = updateDietDto.IsTemplate;
            diet.DietDays = updateDietDto.Days.Select(d => new DietDay
            {
                DayName = d.DayName,
                DietMeals = d.Meals.Select(m => new DietMeal
                {
                    Meal = m.Meal,
                    MealType = m.Type
                }).ToList()
            }).ToList();

            _dietRepository.UpdateDiet(diet);

            if (await _dietRepository.Commit())
            {
                return Result<DietDto>.Ok(new DietDto
                {
                    Id = diet.Id,
                    Name = diet.Name,
                    IsTemplate = diet.IsTemplate,
                    DateCreated = diet.DateCreated,
                    Days = updateDietDto.Days
                });
            }

            return Result<DietDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToUpdateDiet",
                    Message = "Failed to update diet"
                }
            });
        }

        public async Task<Result<DietDto>> GetDietByIdAsync(Guid id)
        {
            var diet = await _dietRepository.GetDietByIdAsync(id);
            if (diet == null)
            {
                return Result<DietDto>.NotFound();
            }

            var dietDto = new DietDto
            {
                Id = diet.Id,
                Name = diet.Name,
                IsTemplate = diet.IsTemplate,
                DateCreated = diet.DateCreated,
                Days = diet.DietDays.Select(d => new DayDto
                {
                    DayName = d.DayName,
                    Meals = d.DietMeals.Select(m => new MealDto
                    {
                        Meal = m.Meal,
                        Type = m.MealType
                    }).ToList()
                }).ToList()
            };

            return Result<DietDto>.Ok(dietDto);
        }

        public async Task<Result<List<DietDto>>> GetAllDietsAsync()
        {
            var diets = await _dietRepository.GetAllDietsAsync();
            var dietDtos = diets.Select(d => new DietDto
            {
                Id = d.Id,
                Name = d.Name,
                IsTemplate = d.IsTemplate,
                DateCreated = d.DateCreated,
                Days = d.DietDays.Select(day => new DayDto
                {
                    DayName = day.DayName,
                    Meals = day.DietMeals.Select(meal => new MealDto
                    {
                        Meal = meal.Meal,
                        Type = meal.MealType
                    }).ToList()
                }).ToList()
            }).ToList();

            return Result<List<DietDto>>.Ok(dietDtos);
        }

        public async Task<Result<Empty>> DeleteDietAsync(Guid id)
        {
            var diet = await _dietRepository.GetDietByIdAsync(id);
            if (diet == null)
            {
                return Result<Empty>.NotFound();
            }

            _dietRepository.DeleteDiet(diet);

            if (await _dietRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToDeleteDiet",
                    Message = "Failed to delete diet"
                }
            });
        }
    }
}