using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Services.IServices;
using API.Common;
using API.Data;
using API.Models.Advice;
using API.Repositories.IRepositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Components.Web;
using API.Helpers;

namespace API.Services
{
    // Service class for handling advice-related operations
    public class AdviceService : IAdviceService 
    {
            // Dependency on the advice repository
            private readonly IAdviceRepository _adviceRepository;

        // Constructor to inject the advice repository dependency
        public AdviceService(IAdviceRepository adviceRepository)
        {
            _adviceRepository = adviceRepository;
        }

        // Method to create a new advice entry
        public async Task<Result<AdviceDto>> CreateAdviceAsync(CreateAdviceDto createAdviceDto)
        {
            // Create a new Advice object from the DTO
            var advice = new Advice
            {
                Title = createAdviceDto.Title,
                AdviceText = createAdviceDto.AdviceText
            };

            // Add the new advice to the repository
            _adviceRepository.CreateAdvice(advice);

            // Commit the changes to the repository
            if (await _adviceRepository.Commit())
            {
                // Return a successful result with the created advice details
                return Result<AdviceDto>.Ok(new AdviceDto
                {
                    Id = advice.Id,
                    Title = advice.Title,
                    AdviceText = advice.AdviceText,
                    DateCreated = advice.DateCreated
                });
            }

            // Return a bad request result if the commit fails
            return Result<AdviceDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedCreatingAdvice",
                    Message = "Failed to create advice"
                }
            });
        }

        // Method to delete an advice entry by its ID
        public async Task<Result<Empty>> DeleteAdviceAsync(Guid adviceId)
        {
            
            var advice = await _adviceRepository.GetAdviceAsync(adviceId);
            if (advice == null)
            {
                
                return Result<Empty>.NotFound();
            }

            // Delete the advice from the repository
            _adviceRepository.DeleteAdvice(advice);
            if (await _adviceRepository.Commit())
            {
                
                return Result<Empty>.Ok(new Empty());
            }

           
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedDeletingAdvice",
                    Message = "Failed to delete advice"
                }
            });
        }

        // Method to retrieve an advice entry by its ID
        public async Task<Result<AdviceDto>> GetAdviceAsync(Guid adviceId)
        {
            // Retrieve the advice from the repository
            var advice = await _adviceRepository.GetAdviceAsync(adviceId);
            if (advice == null)
            {
                
                return Result<AdviceDto>.NotFound();
            }

            // Return a successful result with the retrieved advice details
            return Result<AdviceDto>.Ok(new AdviceDto
            {
                Id = advice.Id,
                Title = advice.Title,
                AdviceText = advice.AdviceText,
                DateCreated = advice.DateCreated
            });
        }

        // Method to retrieve all advice entries
        public async Task<Result<List<AdviceDto>>> GetAllAdviceAsync()
        {
            // Retrieve all advice entries from the repository
            var adviceList = await _adviceRepository.GetAllAdviceAsync();
            // Map the advice entries to DTOs
            var adviceDtoList = adviceList.Select(advice => new AdviceDto
            {
                Id = advice.Id,
                Title = advice.Title, 
                AdviceText = advice.AdviceText,
                DateCreated = advice.DateCreated
            }).ToList();
            // Return a successful result with the list of advice DTOs
            return Result<List<AdviceDto>>.Ok(adviceDtoList);
        }

        public async Task<Result<List<AdviceDto>>> SearchAdviceAsync(string searchTerm)
        {
            List<Advice> adviceList = await _adviceRepository.SearchAdviceAsync(searchTerm);

            if(adviceList == null)
            {
                return Result<List<AdviceDto>>.NotFound();
            }

            List<AdviceDto> adviceDtoList = adviceList.Select(advice => new AdviceDto
            {
                Id = advice.Id,
                Title = advice.Title,
                AdviceText = advice.AdviceText,
                DateCreated = advice.DateCreated
            }).ToList();

            return Result<List<AdviceDto>>.Ok(adviceDtoList);
        }

        // Method to update an existing advice entry
        public async Task<Result<AdviceDto>> UpdateAdviceAsync(UpdateAdviceDto updateAdviceDto)
        {
            // Retrieve the advice from the repository
            var advice = await _adviceRepository.GetAdviceAsync(updateAdviceDto.Id);
            if (advice == null)
            {
                return Result<AdviceDto>.NotFound();
            }

            bool changeDetected = UpdatingEntitiesHelperFunction.ChangeInFieldsDetected(advice, updateAdviceDto); // Checking if there is a change in the fields of the advice entity
            
            if(!changeDetected)
            {
                return Result<AdviceDto>.Ok(new AdviceDto
                {
                    Id = advice.Id,
                    Title = advice.Title,
                    AdviceText = advice.AdviceText,
                    DateCreated = advice.DateCreated
                });
            }


            // Update the advice properties
            advice.Title = updateAdviceDto.Title; 
            advice.AdviceText = updateAdviceDto.AdviceText;

            // Commit the changes to the repository
            if (await _adviceRepository.Commit())
            {
                // Return a successful result with the updated advice details
                return Result<AdviceDto>.Ok(new AdviceDto
                {
                    Id = advice.Id,
                    Title = advice.Title,
                    AdviceText = advice.AdviceText,
                    DateCreated = advice.DateCreated
                });
            }

            
            return Result<AdviceDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedUpdatingAdvice",
                    Message = "Failed to update advice"
                }
            });
        }
    }
    
}