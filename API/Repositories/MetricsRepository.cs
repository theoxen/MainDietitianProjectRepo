using API.Data;
using API.Repositories.IRepositories;

namespace API.Repositories
{
    public class MetricsRepository : IMetricsRepository
    {
        private readonly DataContext _dataContext;
        public MetricsRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}