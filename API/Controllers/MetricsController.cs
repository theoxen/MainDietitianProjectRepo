using API.Models.Metric;
using API.Models.Metrics;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Differencing;

namespace API.Controllers
{
    public class MetricsController : BaseApiController
    {
        private readonly IMetricsService _metricsService;
        public MetricsController(IMetricsService metricsService)
        {
            _metricsService = metricsService;
        }

        [HttpPost(Endpoints.Metrics.Add)] // url example: http://localhost:5207/api/metrics/add
        public async Task<IActionResult> AddMetricsAsync(AddMetricsDto addMetricsDto)
        {
            var result = await _metricsService.AddMetricsAsync(addMetricsDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete(Endpoints.Metrics.Delete)] // url example: http://localhost:5207/api/metrics/1b9adb82-9dbe-4453-0edf-08dd5f3f842a
        public async Task<IActionResult> DeleteMetricsAsync(Guid metricsId)
        {
            var result = await _metricsService.DeleteMetricsAsync(metricsId);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Metrics.ViewMetrics)] // url example: http://localhost:5207/api/metrics/1b9adb82-9dbe-4453-0edf-08dd5f3f842a
        public async Task<IActionResult> ViewMetricsAsync(Guid metricsId)
        {
            var result = await _metricsService.ViewMetricsAsync(metricsId);
            return MapToHttpResponse(result);
        }

        [HttpPut(Endpoints.Metrics.EditMetrics)] // url example: http://localhost:5207/api/metrics
        public async Task<IActionResult> EditMetricsAsync(EditMetricsDto editMetricsDto)
        {
            var result = await _metricsService.EditMetricsAsync(editMetricsDto);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Metrics.SearchMetrics)] // url example:http://localhost:5207/api/metrics/search?userid=6fc82001-ac82-4689-9ca0-bb96ebe2eff3&date=2025-03-09
        public async Task<IActionResult> SearchMetricsAsync([FromQuery] Guid userId, [FromQuery] DateTime? date)
        {
            var result = await _metricsService.SearchMetricsAsync(userId, date);
            return MapToHttpResponse(result);
        }
    
    }
}