using API.Common;
using API.Models.Diets;

namespace API.Services.IServices
{
    public interface IDietService
    {
        Task<Result<DietDto>> CreateDietAsync(CreateDietDto createDietDto);
        Task<Result<DietDto>> UpdateDietAsync(UpdateDietDto updateDietDto);
        Task<Result<DietDto>> GetDietByIdAsync(Guid id);
        Task<Result<DietDto>> GetDietByClientIdAsync(Guid id);
        Task<Result<Guid>> GetDietIdByClientIdAsync(Guid id);
        Task<Result<List<DietDto>>> GetAllDietsAsync();
        Task<Result<Empty>> DeleteDietAsync(Guid id);

    }
}