using API.Common;
using API.Data;
using API.Models.Templates;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Services
{
    public class TemplateService : ITemplateService
    {
        private readonly ITemplateRepository _templateRepository;

        public TemplateService(ITemplateRepository templateRepository)
        {
            _templateRepository = templateRepository;
        }

        public async Task<Result<TemplateDto>> CreateTemplateAsync(CreateTemplateDto createTemplateDto)
        {

            // Create the diet template
            var diet = new Diet
            {
                Id = Guid.NewGuid(),
                Name = createTemplateDto.Name,
                IsTemplate = true,
                DateCreated = DateTime.UtcNow
            };

            // Add diet days and meals
            foreach (var dayDto in createTemplateDto.Days)
            {
                var dietDay = new DietDay
                {
                    Id = Guid.NewGuid(),
                    DayName = dayDto.DayName,
                    DietId = diet.Id
                };

                // Add meals for this day
                foreach (var mealDto in dayDto.Meals)
                {
                    var dietMeal = new DietMeal
                    {
                        Id = Guid.NewGuid(),
                        MealType = mealDto.MealType,
                        Meal = mealDto.Meal,
                        DietDayId = dietDay.Id
                    };

                    dietDay.DietMeals.Add(dietMeal);
                }

                diet.DietDays.Add(dietDay);
            }

            // Add to database
            _templateRepository.CreateTemplate(diet);

            if (await _templateRepository.Commit())
            {
                return Result<TemplateDto>.Ok(new TemplateDto
                {
                    Id = diet.Id,
                    Name = diet.Name,
                    IsTemplate = diet.IsTemplate,
                    DateCreated = diet.DateCreated,
                    Days = diet.DietDays.Select(day => new TemplateDayDto
                    {
                        Id = day.Id, 
                        DayName = day.DayName,
                        DietId = day.DietId, 
                        Meals = day.DietMeals.Select(meal => new TemplateMealDto
                        {
                            Id = meal.Id,
                            MealType = meal.MealType,
                            Meal = meal.Meal,
                            DietDayId = meal.DietDayId
                        }).ToList()
                    }).ToList()
                });
            }

            return Result<TemplateDto>.BadRequest(new List<ResultError>{
                new ResultError
                {
                    Identifier = "FailedToCreateTemplate",
                    Message = "Failed to create template."
                }
            });

        }
    }
}