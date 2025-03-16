using API.Data;
using API.Models.Metric;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class MetricsRepository : IMetricsRepository
    {
        private readonly DataContext _dataContext;
        public MetricsRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public void AddMetrics(Metrics metrics)
        {
            _dataContext.Metrics.Add(metrics);
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }

        public void DeleteMetrics(Metrics metrics)
        {
            _dataContext.Metrics.Remove(metrics); 
        }


        public async Task<Metrics?> GetMetricsAsync(Guid metricsId)
        {
            var metrics = await _dataContext.Metrics.FirstOrDefaultAsync(x => x.Id == metricsId);
            return metrics;
        }

        public async Task<List<Metrics>> GetMetricsByUserIdAsync(Guid userId)
        {
            var metrics = await _dataContext.Metrics
            .Where(x => x.UserId == userId)
            .ToListAsync();
            return metrics;
        }


          public async Task<List<Metrics>> SearchMetricsAsync(Guid userId, DateTime? date)
        {
            var query = _dataContext.Metrics.AsQueryable();

            if (userId != Guid.Empty)
            {
                query = query.Where(m => m.UserId == userId);
            }

            if (date.HasValue && date.Value != DateTime.MinValue)
            {
                query = query.Where(m => m.DateCreated.Date == date.Value.Date);
            }

            return await query.ToListAsync();
        }
    }
}