public class DietServices : IDietServices
{
    private readonly IDietsRepository _dietsRepository;

    public DietServices(IDietsRepository dietsRepository)
    {
        _dietsRepository = dietsRepository;
    }

    public async Task<DietDto> CreateDietAsync(DietDto diet)
    {
        return await _dietsRepository.CreateDietAsync(diet);
    }

    public async Task<DietDto> UpdateDietAsync(DietDto diet)
    {
        return await _dietsRepository.UpdateDietAsync(diet);
    }

    public async Task<DietDto> GetDietByIdAsync(int id)
    {
        return await _dietsRepository.GetDietByIdAsync(id);
    }

    public async Task<IEnumerable<DietDto>> GetAllDietsAsync()
    {
        return await _dietsRepository.GetAllDietsAsync();
    }
}
