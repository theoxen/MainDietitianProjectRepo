using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.IRepositories;

public class DietTypeRepository : IDietTypeRepository
{
    private readonly DataContext _context;

    public DietTypeRepository(DataContext context)
    {
        this._context = context;
    }

    

    public Task<List<DietType>> GetAllDietTypesAsync()
    {
        return _context.DietTypes.ToListAsync();
    }

    public Task<DietType?> GetDietTypeByIdAsync(Guid id)
    {
        return _context.DietTypes.FirstOrDefaultAsync(x => x.Id == id);
    }
    
    public async Task<bool> Commit()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
