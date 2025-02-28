using API.Common;
using API.Data;
using API.Models.Metric;
using API.Models.Metrics;

namespace API.Services.IServices
{
    public interface IMetricsService
    {
        public Task<Result<MetricsDto>> AddMetricsAsync(AddMetricsDto addMetricsDto);
        public Task<Result<MetricsDto>> EditMetricsAsync(EditMetricsDto editMetricsDto); 
        public Task<Result<Empty>> DeleteMetricsAsync(Guid MetricsId); 
        public Task<Result<MetricsDto>> ViewMetricsAsync(Guid MetricsId); 
        public Task<Result<List<MetricsDto>>> SearchMetricsAsync(Guid userId, DateTime? date); // searches and displays specific's date metrics for the selected client 
        //todo Search Metrics 
    }
}