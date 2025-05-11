using API.Data;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    // Inherits from BaseApiController which contains common API functionality
    public class AppointmentsController : BaseApiController
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpPost(Endpoints.Appointments.Make)] // url example: http://localhost:5207/api/appointments 
        public async Task<IActionResult> MakeAnAppointmentAsync(MakeAnAppointmentDto makeAnAppointmentDto)
        {
            var result = await _appointmentService.MakeAnAppointmentAsync(makeAnAppointmentDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete(Endpoints.Appointments.Cancel)] // url example: http://localhost:5207/api/appointments/4d34d6c2-c1a0-40ea-5ebd-08dd72ce4f47
        public async Task<IActionResult> CancelAppointmentAsync(Guid appointmentId)
        {
            var result = await _appointmentService.CancelAppointmentAsync(appointmentId);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Appointments.View)] // url example: http://localhost:5207/api/appointments/aa18db95-dddd-46ee-384d-08dd649a4678
        public async Task<IActionResult> ViewAppointmentsAsync(Guid appointmentId)
        {
            var result = await _appointmentService.ViewAppointmetsAsync(appointmentId);
            return MapToHttpResponse(result);
        }
        

         [HttpGet(Endpoints.Appointments.Search)] // url example: http://localhost:5207/api/appointments/search?date=2025-03-16
        public async Task<IActionResult> SearchAppointmentsAsync([FromQuery] DateTime? date)
        {
            var result = await _appointmentService.SearchAppointmentsAsync(date);
            return MapToHttpResponse(result);
        }
    }
}