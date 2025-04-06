using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    public class ReportsController : BaseApiController
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }


        //litout of users based on age
        //how many new users have registered
        [HttpGet("api/reports/users/{datestart}/{dateend}")]
        public async Task<IActionResult> GetUsersReport(DateOnly datestart, DateOnly dateend)
        {
            var result = await _reportService.GetUsersReport(datestart, dateend);
            return MapToHttpResponse(result);
        }


        //litout of users based on age 
        //age group of users
        [HttpGet("api/reports/agegroup/{agestart}/{ageend}")]
        public async Task<IActionResult> GetAgeGroupReport(int agestart, int ageend)
        {
            var result = await _reportService.GetAgeGroupReport(agestart, ageend);
            return MapToHttpResponse(result);
        }   





        //appointment how many appointments have been made
        //what is the most popular time for appointments
        [HttpGet("api/reports/appointment/{datestart}/{dateend}")]
        public async Task<IActionResult> GetAppointmentReport(DateOnly datestart, DateOnly dateend)
        {
           
            var result = await _reportService.GetAppointmentReport(datestart, dateend);
            return MapToHttpResponse(result);
        }



        //litout of users based on diet type
        //users reports type 
        [HttpGet("api/reports/userstype/{dietTypeId}")]
        public async Task<IActionResult> GetUsertypeReport(Guid dietTypeId)
        {
            var result = await _reportService.GetUsertypeReport(dietTypeId);
            return MapToHttpResponse(result);
        }

    }
}