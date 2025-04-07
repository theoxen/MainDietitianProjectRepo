using API.Common;
using API.Data;
using API.Models.Templates;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Http.HttpResults;
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

        public async Task<Result<TemplateDto>> UpdateTemplateAsync(UpdateTemplateDto updateTemplateDto)
        {
            // Find the existing template
            var existingTemplate = await _templateRepository.GetTemplateByIdAsync(updateTemplateDto.Id);

            if (existingTemplate == null)
            {
                return Result<TemplateDto>.NotFound();
            }

            // Update basic properties
            existingTemplate.Name = updateTemplateDto.Name;

            // Clear existing days and meals
            existingTemplate.DietDays.Clear();

            // Add updated days and meals
            foreach (var dayDto in updateTemplateDto.Days)
            {
                var dietDay = new DietDay
                {
                    Id = dayDto.Id,
                    DayName = dayDto.DayName,
                    DietId = existingTemplate.Id
                };

                // Add meals for this day
                foreach (var mealDto in dayDto.Meals)
                {
                    var dietMeal = new DietMeal
                    {
                        Id = mealDto.Id,
                        MealType = mealDto.MealType,
                        Meal = mealDto.Meal,
                        DietDayId = dietDay.Id
                    };

                    dietDay.DietMeals.Add(dietMeal);
                }

                existingTemplate.DietDays.Add(dietDay);
            }

            if (await _templateRepository.Commit())
            {
                return Result<TemplateDto>.Ok(new TemplateDto
                {
                    Id = existingTemplate.Id,
                    Name = existingTemplate.Name,
                    IsTemplate = existingTemplate.IsTemplate,
                    DateCreated = existingTemplate.DateCreated,
                    Days = existingTemplate.DietDays.Select(day => new TemplateDayDto
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
                    Identifier = "FailedToUpdateTemplate",
                    Message = "Failed to update template."
                }
            });
        }

        public async Task<Result<TemplateDto>> GetTemplateByIdAsync(Guid id)
        {
            var template = await _templateRepository.GetTemplateByIdAsync(id);
            if (template == null)
            {
                return Result<TemplateDto>.NotFound();
            }

            return Result<TemplateDto>.Ok(new TemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                IsTemplate = template.IsTemplate,
                DateCreated = template.DateCreated,
                Days = template.DietDays.Select(day => new TemplateDayDto
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

        public async Task<Result<List<TemplateBriefDto>>> GetAllTemplatesBriefAsync()
        {
            var templatesBrief = await _templateRepository.GetAllTemplatesBriefAsync();
            
            return Result<List<TemplateBriefDto>>.Ok(templatesBrief.Select(template => new TemplateBriefDto
            {
                Id = template.Id,
                Name = template.Name,
                IsTemplate = template.IsTemplate,
                DateCreated = template.DateCreated
            }).ToList());
        }

        public async Task<Result<Empty>> DeleteTemplateAsync(Guid id)
        {
            var template = await _templateRepository.GetTemplateByIdAsync(id);
            if(template == null)
            {
                return Result<Empty>.NotFound();
            }


            _templateRepository.DeleteTemplate(template);

            if(await _templateRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            return Result<Empty>.BadRequest(new List<ResultError>{
                new ResultError
                {
                    Identifier = "FailedToDeleteTemplate",
                    Message = "Failed to delete template."
                }
            });
        }
    }
}