using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IMetricsRepository : IBaseRepository
    {
        public void AddMetrics(Metrics metrics);
        public void DeleteMetrics(Metrics metrics);
        public Task<List<Metrics>> SearchMetricsAsync(Guid userId, DateTime? date);
        public Task<Metrics?> GetMetricsAsync(Guid metricsId);
    }
}