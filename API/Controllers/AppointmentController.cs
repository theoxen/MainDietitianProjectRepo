using API.Data;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AppointmentsController : BaseApiController
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpPost(Endpoints.Appointments.Make)]
        public async Task<IActionResult> MakeAnAppointmentAsync(MakeAnAppointmentDto makeAnAppointmentDto)
        {
            var result = await _appointmentService.MakeAnAppointmentAsync(makeAnAppointmentDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete(Endpoints.Appointments.Cancel)] // url example: http://localhost:5207/api/metrics/131c296e-75cd-476b-ad9b-a430d986c736
        public async Task<IActionResult> CancelAppointmentAsync(Guid appointmentId)
        {
            var result = await _appointmentService.CancelAppointmentAsync(appointmentId);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Appointments.View)] // url example: http://localhost:5207/api/metrics/view-metrics?MetricsId=131c296e-75cd-476b-ad9b-a430d986c736
        public async Task<IActionResult> ViewAppointmentsAsync(Guid appointmentId)
        {
            var result = await _appointmentService.ViewAppointmetsAsync(appointmentId);
            return MapToHttpResponse(result);
        }
        

         [HttpGet(Endpoints.Appointments.Search)] // url example: http://localhost:5207/api/metrics/search?userId=131c296e-75cd-476b-ad9b-a430d986c736&date=2021-09-01&date=2021-09-30
        public async Task<IActionResult> SearchAppointmentsAsync([FromQuery] DateTime? date)
        {
            var result = await _appointmentService.SearchAppointmentsAsync(date);
            return MapToHttpResponse(result);
        }
    }
}