using API.Common;
using API.Mappings;
using API.Models.DietTypes;
using API.Repositories.IRepositories;
using API.Services.IServices;

namespace API.Services;

public class DietTypesService : IDietTypesService
{
    private readonly IDietTypeRepository dietTypeRepository;

    public DietTypesService(IDietTypeRepository dietTypeRepository)
    {
        this.dietTypeRepository = dietTypeRepository;
    }
    public async Task<Result<List<DietTypeDto>>> GetAllDietTypesAsync()
    {
        var dietTypes=await dietTypeRepository.GetAllDietTypesAsync();

        return Result<List<DietTypeDto>>.Ok(dietTypes.MapToDto());
    }
}
