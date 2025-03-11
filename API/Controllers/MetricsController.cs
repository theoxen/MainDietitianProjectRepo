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

        [HttpPost(Endpoints.Metrics.Add)]
        public async Task<IActionResult> AddMetricsAsync(AddMetricsDto addMetricsDto)
        {
            var result = await _metricsService.AddMetricsAsync(addMetricsDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete(Endpoints.Metrics.Delete)] // url example: http://localhost:5207/api/metrics/131c296e-75cd-476b-ad9b-a430d986c736
        public async Task<IActionResult> DeleteMetricsAsync(Guid metricsId)
        {
            var result = await _metricsService.DeleteMetricsAsync(metricsId);
            return MapToHttpResponse(result);
        }

        // [HttpGet(Endpoints.Metrics.ViewMetrics)] // url example: http://localhost:5207/api/metrics/view-metrics?MetricsId=131c296e-75cd-476b-ad9b-a430d986c736
        // public async Task<IActionResult> ViewMetricsAsync(Guid metricsId)
        // {
        //     var result = await _metricsService.ViewMetricsAsync(metricsId);
        //     return MapToHttpResponse(result);
        // }

        [HttpPut(Endpoints.Metrics.EditMetrics)] // UPDATE IS HTTP PUT!
        public async Task<IActionResult> EditMetricsAsync(EditMetricsDto editMetricsDto)
        {
            var result = await _metricsService.EditMetricsAsync(editMetricsDto);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Metrics.SearchMetrics)] // url example: http://localhost:5207/api/metrics/search?userId=131c296e-75cd-476b-ad9b-a430d986c736&date=2021-09-01&date=2021-09-30
        public async Task<IActionResult> SearchMetricsAsync([FromQuery] Guid userId, [FromQuery] DateTime? date)
        {
            var result = await _metricsService.SearchMetricsAsync(userId, date);
            return MapToHttpResponse(result);
        }
    
    }
}