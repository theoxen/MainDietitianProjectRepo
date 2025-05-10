using API.Common;
using API.Data;
using API.Models.Templates;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Services
{
    /// <summary>
    /// Service responsible for handling diet template operations
    /// Implements the ITemplateService interface to provide CRUD operations for templates
    /// </summary>
    public class TemplateService : ITemplateService
    {
        private readonly ITemplateRepository _templateRepository;

        /// <summary>
        /// Constructor using dependency injection to get repository access
        /// </summary>
        public TemplateService(ITemplateRepository templateRepository)
        {
            _templateRepository = templateRepository;
        }

        /// <summary>
        /// Creates a new diet template with days and meals
        /// </summary>
        /// <param name="createTemplateDto">Contains the template structure with days and meals</param>
        /// <returns>Result containing the created template if successful</returns>
        public async Task<Result<TemplateDto>> CreateTemplateAsync(CreateTemplateDto createTemplateDto)
        {
            // Create the diet template with a new unique identifier
            var diet = new Diet
            {
                Id = Guid.NewGuid(),
                Name = createTemplateDto.Name,
                IsTemplate = true,
                DateCreated = DateTime.UtcNow
            };

            // Iterate through each day from the DTO and create corresponding database entities
            foreach (var dayDto in createTemplateDto.Days)
            {
                var dietDay = new DietDay
                {
                    Id = Guid.NewGuid(),
                    DayName = dayDto.DayName,
                    DietId = diet.Id
                };

                // For each day, create all associated meals
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

            // Persist to database using repository pattern
            _templateRepository.CreateTemplate(diet);

            // If save successful, map the domain entity back to DTO for response
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

            // Return error if database operations failed
            return Result<TemplateDto>.BadRequest(new List<ResultError>{
                new ResultError
                {
                    Identifier = "FailedToCreateTemplate",
                    Message = "Failed to create template."
                }
            });
        }

        /// <summary>
        /// Updates an existing diet template with new content
        /// </summary>
        /// <param name="updateTemplateDto">Contains the updated template data</param>
        /// <returns>The updated template if successful</returns>
        public async Task<Result<TemplateDto>> UpdateTemplateAsync(UpdateTemplateDto updateTemplateDto)
        {
            // Retrieve the existing template by id
            var existingTemplate = await _templateRepository.GetTemplateByIdAsync(updateTemplateDto.Id);

            // Return not found if template doesn't exist
            if (existingTemplate == null)
            {
                return Result<TemplateDto>.NotFound();
            }

            // Update basic properties from the DTO
            existingTemplate.Name = updateTemplateDto.Name;

            // Remove existing days and meals for replacement
            existingTemplate.DietDays.Clear();

            // Rebuild diet days and meals structure from the DTO
            foreach (var dayDto in updateTemplateDto.Days)
            {
                var dietDay = new DietDay
                {
                    Id = dayDto.Id,
                    DayName = dayDto.DayName,
                    DietId = existingTemplate.Id
                };

                // Add all meals for the current day
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

            // Save changes and return updated template if successful
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

            // Return error if update failed
            return Result<TemplateDto>.BadRequest(new List<ResultError>{
                new ResultError
                {
                    Identifier = "FailedToUpdateTemplate",
                    Message = "Failed to update template."
                }
            });
        }

        /// <summary>
        /// Retrieves a template by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the template</param>
        /// <returns>The template with all its days and meals</returns>
        public async Task<Result<TemplateDto>> GetTemplateByIdAsync(Guid id)
        {
            // Get template including all related data
            var template = await _templateRepository.GetTemplateByIdAsync(id);
            
            // Return not found if template doesn't exist
            if (template == null)
            {
                return Result<TemplateDto>.NotFound();
            }

            // Map domain entity to DTO and return
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

        /// <summary>
        /// Gets a list of all templates with basic information (no days or meals)
        /// </summary>
        /// <returns>List of templates with minimal data for display in lists</returns>
        public async Task<Result<List<TemplateBriefDto>>> GetAllTemplatesBriefAsync()
        {
            // Get all templates with only basic information
            var templatesBrief = await _templateRepository.GetAllTemplatesBriefAsync();
            
            // Map to DTOs and return the list
            return Result<List<TemplateBriefDto>>.Ok(templatesBrief.Select(template => new TemplateBriefDto
            {
                Id = template.Id,
                Name = template.Name,
                IsTemplate = template.IsTemplate,
                DateCreated = template.DateCreated
            }).ToList());
        }

        /// <summary>
        /// Deletes a template by its identifier
        /// </summary>
        /// <param name="id">The unique identifier of the template to delete</param>
        /// <returns>Success or error message</returns>
        public async Task<Result<Empty>> DeleteTemplateAsync(Guid id)
        {
            // Find template by id
            var template = await _templateRepository.GetTemplateByIdAsync(id);
            
            // Return not found if template doesn't exist
            if(template == null)
            {
                return Result<Empty>.NotFound();
            }

            // Delete through repository
            _templateRepository.DeleteTemplate(template);

            // Return success if commit succeeds
            if(await _templateRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            // Return error if deletion failed
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