using API.Data;
using API.Common;
using API.Models.Diets;
using API.Repositories.IRepositories;
using API.Services.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using Microsoft.AspNetCore.Identity;
using API.Models.Templates;

namespace API.Services
{
    /// <summary>
    /// Service responsible for managing diet-related operations including creation, 
    /// retrieval, update, and deletion of diet plans.
    /// Implements IDietService interface to provide diet management functionality.
    /// </summary>
    public class DietService : IDietService
    {
        private readonly UserManager<User> _userManager;
        private readonly IDietRepository _dietRepository;

        private readonly ITemplateService _templateService;

        private readonly ILogger<DietService> _logger;  //for debugging use only - can be removed

        /// <summary>
        /// Constructor injecting required dependencies:
        /// - UserManager: For user validation and operations
        /// - DietRepository: For data access related to diets
        /// - TemplateService: For handling template-related operations
        /// - Logger: For diagnostic information during development
        /// </summary>
        public DietService(
            UserManager<User> userManager,
            IDietRepository dietRepository,
            ITemplateService templateService,
            ILogger<DietService> logger)
        {
            _userManager = userManager;
            _dietRepository = dietRepository;
            _templateService = templateService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new diet based on the provided DTO.
        /// Validates user existence before creating the diet.
        /// If marked as template, also stores it as a template.
        /// </summary>
        /// <param name="createDietDto">Data transfer object containing diet information</param>
        /// <returns>Result with created diet data or appropriate error</returns>
        public async Task<Result<DietDto>> CreateDietAsync(CreateDietDto createDietDto)
        {
            // Validation: Check if each user in the UserDiets list exists in the database
            foreach (var userDiet in createDietDto.UserDiets)
            {
                var user = await _userManager.FindByIdAsync(userDiet.UserId.ToString());
                if (user == null) // If the given userId is not found in the database
                {
                    return Result<DietDto>.BadRequest(new List<ResultError>
                {
                    new ResultError
                    {
                        Identifier = "UserDoesNotExists",
                        Message = "You can not create a diet for a user that does not exist"
                    }
                });
                }
            }

            
            // Check if a diet with the same name already exists for the user
            // Currently commented out - can be uncommented if needed
            // var existingDiet = await _dietRepository.GetDietByNameAsync(createDietDto.Name);
            // if (existingDiet != null)
            // {
            //     return Result<DietDto>.BadRequest(new List<ResultError>
            //     {
            //         new ResultError
            //         {
            //             Identifier = "DietAlreadyExists",
            //             Message = "A diet with the same name already exists"
            //         }
            //     });
            // }


            // Handle template creation if this diet should also be saved as a template
            if (createDietDto.IsTemplate == true)
            {
                // Convert the DietDto to a TemplateDto
                var createTemplateDto = new CreateTemplateDto
                {
                    Name = createDietDto.Name,
                    Days = createDietDto.Days.Select(d => new CreateDietDayDto
                    {
                        DayName = d.DayName,
                        Meals = d.Meals.Select(m => new CreateDietMealDto
                        {
                            MealType = m.Type,
                            Meal = m.Meal
                        }).ToList()
                    }).ToList()
                };
                
                // Call the template service to create the template
                var templateResult = await _templateService.CreateTemplateAsync(createTemplateDto);
            }

            // Create a new Diet entity with data from the DTO
            var diet = new Diet
            {
                Name = createDietDto.Name,
                IsTemplate = false, // Set to false since this is not a template

                // Map user associations
                UserDiets = createDietDto.UserDiets.Select(ud => new UserDiet
                {
                    UserId = ud.UserId 
                }).ToList(),

                // Map diet days and meals
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

            // Add the diet to the database
            _dietRepository.CreateDiet(diet);

            // Save changes and return success or failure
            if (await _dietRepository.Commit())
            {
                // Return success with the created diet data
                return Result<DietDto>.Ok(new DietDto
                {
                    Id = diet.Id,
                    Name = diet.Name,
                    IsTemplate = diet.IsTemplate,
                    DateCreated = diet.DateCreated,
                    UserDiets = createDietDto.UserDiets,
                    Days = createDietDto.Days
                });
            }

            // Return error if database commit failed
            return Result<DietDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToCreateDiet",
                    Message = "Failed to create diet"
                }
            });
        }

        /// <summary>
        /// Updates an existing diet with new information.
        /// </summary>
        /// <param name="updateDietDto">Data transfer object containing updated diet information</param>
        /// <returns>Result with updated diet data or appropriate error</returns>
        public async Task<Result<DietDto>> UpdateDietAsync(UpdateDietDto updateDietDto)
        {
            // Retrieve the existing diet from the database
            var diet = await _dietRepository.GetDietByIdAsync(updateDietDto.Id);
            if (diet == null)
            {
                return Result<DietDto>.NotFound();
            }

            // Update diet properties with new values
            diet.Name = updateDietDto.Name;
            diet.IsTemplate = updateDietDto.IsTemplate;
            diet.DateCreated = DateTime.UtcNow;
            // Replace all diet days and meals with the updated ones
            diet.DietDays = updateDietDto.Days.Select(d => new DietDay
            {
                DayName = d.DayName,
                DietMeals = d.Meals.Select(m => new DietMeal
                {
                    Meal = m.Meal,
                    MealType = m.Type
                }).ToList()
            }).ToList();

            // Update the diet in the repository
            _dietRepository.UpdateDiet(diet);

            // Save changes and return success or failure
            if (await _dietRepository.Commit())
            {
                // Return success with updated diet data
                return Result<DietDto>.Ok(new DietDto
                {
                    Id = diet.Id,
                    Name = diet.Name,
                    IsTemplate = diet.IsTemplate,
                    DateCreated = diet.DateCreated,
                    UserDiets = updateDietDto.UserDiets, 
                    Days = updateDietDto.Days
                });
            }

            // Return error if database commit failed
            return Result<DietDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToUpdateDiet",
                    Message = "Failed to update diet"
                }
            });
        }

        /// <summary>
        /// Retrieves diet information by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the diet to retrieve</param>
        /// <returns>Result with diet data or NotFound if diet does not exist</returns>
        public async Task<Result<DietDto>> GetDietByIdAsync(Guid id)
        {
            // Retrieve the diet from the database
            var diet = await _dietRepository.GetDietByIdAsync(id);
            if (diet == null)
            {
                return Result<DietDto>.NotFound();
            }

            // Map the diet entity to a DTO for the response
            var dietDto = new DietDto
            {
                Id = diet.Id,
                Name = diet.Name,
                IsTemplate = diet.IsTemplate,
                DateCreated = diet.DateCreated,
                // Map user associations
                UserDiets = diet.UserDiets.Select(userdiet => new UserDietDto
                {
                    UserId = userdiet.UserId
                }).ToList(),
                
                // Map diet days and meals
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

        /// <summary>
        /// Retrieves all diets available in the system.
        /// </summary>
        /// <returns>Result with list of all diet data</returns>
        public async Task<Result<List<DietDto>>> GetAllDietsAsync()
        {
            // Retrieve all diets from the database
            var diets = await _dietRepository.GetAllDietsAsync();
            
            // Map each diet entity to a DTO for the response
            var dietDtos = diets.Select(d => new DietDto
            {
                Id = d.Id,
                Name = d.Name,
                IsTemplate = d.IsTemplate,
                DateCreated = d.DateCreated,
                // Map user associations
                UserDiets = d.UserDiets.Select(userdiet => new UserDietDto
                {
                    UserId = userdiet.UserId
                }).ToList(),

                // Map diet days and meals
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

        /// <summary>
        /// Deletes a diet by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the diet to delete</param>
        /// <returns>Result indicating success or failure</returns>
        public async Task<Result<Empty>> DeleteDietAsync(Guid id)
        {
            // Retrieve the diet to delete from the database
            var diet = await _dietRepository.GetDietByIdAsync(id);
            if (diet == null)
            {
                return Result<Empty>.NotFound();
            }

            // Delete the diet from the repository
            _dietRepository.DeleteDiet(diet);

            // Save changes and return success or failure
            if (await _dietRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            // Return error if database commit failed
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToDeleteDiet",
                    Message = "Failed to delete diet"
                }
            });
        }

        /// <summary>
        /// Gets a diet associated with a specific client (user).
        /// </summary>
        /// <param name="userId">The ID of the user/client whose diet to retrieve</param>
        /// <returns>Result with diet data or NotFound if diet does not exist</returns>
        public async Task<Result<DietDto>> GetDietByClientIdAsync(Guid userId)
        {
            // First get the diet ID associated with this user
            var dietId = await _dietRepository.GetDietIdByClientIdAsync(userId);
           
            // Retrieve the complete diet using the found ID
            var diet = await _dietRepository.GetDietByIdAsync(dietId);
            if (diet == null)
            {
                return Result<DietDto>.NotFound();
            }

            // Map the diet entity to a DTO for the response
            var dietDto = new DietDto
            {
                Id = diet.Id,
                Name = diet.Name,
                IsTemplate = diet.IsTemplate,
                DateCreated = diet.DateCreated,
                // Map user associations
                UserDiets = diet.UserDiets.Select(userdiet => new UserDietDto
                {
                    UserId = userdiet.UserId
                }).ToList(),
                
                // Map diet days and meals
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

        /// <summary>
        /// Gets the diet ID associated with a specific client.
        /// Used when you only need the ID reference, not the complete diet data.
        /// </summary>
        /// <param name="userId">The ID of the user/client whose diet ID to retrieve</param>
        /// <returns>Result with the diet ID or NotFound if no diet exists for the user</returns>
        public async Task<Result<Guid>> GetDietIdByClientIdAsync(Guid userId)
        {
            // Retrieve the DietId from the repository.
            Guid dietId = await _dietRepository.GetDietIdByClientIdAsync(userId);

            // Optional: Log the retrieved DietId for debugging.
            _logger?.LogInformation("Retrieved DietId for user {UserId}: {DietId}", userId, dietId);

            // If no DietId is found (i.e. Guid.Empty), return a NotFound result.
            if (dietId == Guid.Empty)
            {
                return Result<Guid>.NotFound();
            }

            // Otherwise, return the DietId wrapped in an Ok result.
            return Result<Guid>.Ok(dietId);
        }

        /// <summary>
        /// Searches for diets matching specific criteria - by user and/or date.
        /// </summary>
        /// <param name="userId">User ID to filter by (optional)</param>
        /// <param name="date">Date to filter by (optional)</param>
        /// <returns>Result with list of matching diets or NotFound if none found</returns>
        public async Task<Result<List<DietDto>>> SearchDietsAsync(Guid userId, DateTime? date)
        {
            // Search for diets matching the criteria
            var diets = await _dietRepository.SearchDietsAsync(userId, date);
            if (diets == null || !diets.Any())
            {
                return Result<List<DietDto>>.NotFound();
            }

            // Map each found diet entity to a DTO for the response
            var dietsDtoList = diets.Select(m => new DietDto
            {
                Id = m.Id,
                Name = m.Name,
                IsTemplate = m.IsTemplate,
                DateCreated = m.DateCreated,
                UserDiets = m.UserDiets.Select(userdiet => new UserDietDto
                {
                    UserId = userdiet.UserId
                }).ToList(),
                Days = m.DietDays.Select(d => new DayDto
                {
                    DayName = d.DayName,
                    Meals = d.DietMeals.Select(meal => new MealDto
                    {
                        Meal = meal.Meal,
                        Type = meal.MealType
                    }).ToList()
                }).ToList()
            }).ToList();

            return Result<List<DietDto>>.Ok(dietsDtoList);
        }
    }
}