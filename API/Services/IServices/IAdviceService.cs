using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Common;
using API.Data;
using API.Models.Advice;

namespace API.Services.IServices
{
    public interface IAdviceService
    {
        Task<Result<AdviceDto>> CreateAdviceAsync(CreateAdviceDto createAdviceDto);
        Task<Result<Empty>> DeleteAdviceAsync(Guid adviceId);
        Task<Result<AdviceDto>> GetAdviceAsync(Guid adviceId);
        Task<Result<List<AdviceDto>>> GetAllAdviceAsync();
        Task<Result<AdviceDto>> UpdateAdviceAsync(UpdateAdviceDto updateAdviceDto);
        Task<Result<List<AdviceDto>>> SearchAdviceAsync(string searchTerm);
    }
}