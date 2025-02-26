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

namespace API.Services
{
    public class AdviceService : IAdviceService 
    {
            private readonly IAdviceRepository _adviceRepository;

        public AdviceService(IAdviceRepository adviceRepository)
        {
            _adviceRepository = adviceRepository;
        }

        public async Task<Result<AdviceDto>> CreateAdviceAsync(CreateAdviceDto createAdviceDto)
        {
            var advice = new Advice
            {
                AdviceText = createAdviceDto.AdviceText
            };

            _adviceRepository.CreateAdvice(advice);

            if (await _adviceRepository.Commit())
            {
                return Result<AdviceDto>.Ok(new AdviceDto
                {
                    Id = advice.Id,
                    AdviceText = advice.AdviceText,
                    DateCreated = advice.DateCreated
                });
            }

            return Result<AdviceDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedCreatingAdvice",
                    Message = "Failed to create advice"
                }
            });
        }

        public async Task<Result<Empty>> DeleteAdviceAsync(Guid adviceId)
        {
            var advice = await _adviceRepository.GetAdviceAsync(adviceId);
            if (advice == null)
            {
                return Result<Empty>.NotFound();
            }

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

        public async Task<Result<AdviceDto>> GetAdviceAsync(Guid adviceId)
        {
            var advice = await _adviceRepository.GetAdviceAsync(adviceId);
            if (advice == null)
            {
                return Result<AdviceDto>.NotFound();
            }

            return Result<AdviceDto>.Ok(new AdviceDto
            {
                Id = advice.Id,
                AdviceText = advice.AdviceText,
                DateCreated = advice.DateCreated
            });
        }

        public async Task<Result<IEnumerable<AdviceDto>>> GetAllAdviceAsync()
        {
            var adviceList = await _adviceRepository.GetAllAdviceAsync();
            var adviceDtoList = adviceList.Select(advice => new AdviceDto
            {
                Id = advice.Id,
                AdviceText = advice.AdviceText,
                DateCreated = advice.DateCreated
            });

            return Result<IEnumerable<AdviceDto>>.Ok(adviceDtoList);
        }

        public async Task<Result<AdviceDto>> UpdateAdviceAsync(UpdateAdviceDto updateAdviceDto)
        {
            var advice = await _adviceRepository.GetAdviceAsync(updateAdviceDto.Id);
            if (advice == null)
            {
                return Result<AdviceDto>.NotFound();
            }

            advice.AdviceText = updateAdviceDto.AdviceText;

            if (await _adviceRepository.Commit())
            {
                return Result<AdviceDto>.Ok(new AdviceDto
                {
                    Id = advice.Id,
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