using API.Data;
using API.Repositories.IRepositories;

namespace API.Repositories
{
    public class DietRepository : IDietRepository
    {
        private readonly DataContext _dataContext;
        public DietRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}