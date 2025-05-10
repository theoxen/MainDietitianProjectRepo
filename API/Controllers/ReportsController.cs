using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    // Controller responsible for generating various administrative reports
    // Inherits from BaseApiController which contains common controller functionality
    public class ReportsController : BaseApiController
    {
        // Dependency injection of report service to handle business logic
        private readonly IReportService _reportService;

        // Constructor initializes the report service dependency
        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        // Endpoint to get user registration reports within a date range
        // Returns: List of users who registered between the specified dates
        // Access: Admin only
        [Authorize(Roles = "admin")]
        [HttpGet("api/reports/users/{datestart}/{dateend}")]
        public async Task<IActionResult> GetUsersReport(DateOnly datestart, DateOnly dateend)
        {
            var result = await _reportService.GetUsersReport(datestart, dateend);
            return MapToHttpResponse(result);
        }

        // Endpoint to get users within a specific age range
        // Parameters: agestart and ageend define the age range to filter users
        // Returns: List of users whose age falls within the specified range
        // Access: Admin only
        [Authorize(Roles = "admin")]
        [HttpGet("api/reports/agegroup/{agestart}/{ageend}")]
        public async Task<IActionResult> GetAgeGroupReport(int agestart, int ageend)
        {
            var result = await _reportService.GetAgeGroupReport(agestart, ageend);
            return MapToHttpResponse(result);
        }   

        // Endpoint to analyze appointment patterns within a date range
        // Useful for tracking appointment volume and popular booking times
        // Returns: List of appointments between the specified dates
        // Access: Admin only
        [Authorize(Roles = "admin")]
        [HttpGet("api/reports/appointment/{datestart}/{dateend}")]
        public async Task<IActionResult> GetAppointmentReport(DateOnly datestart, DateOnly dateend)
        {
            var result = await _reportService.GetAppointmentReport(datestart, dateend);
            return MapToHttpResponse(result);
        }

        // Endpoint to get users following a specific diet type
        // Parameter: dietTypeId identifies the specific diet type to filter by
        // Returns: List of users following the specified diet type
        // Access: Admin only
        [Authorize(Roles = "admin")]
        [HttpGet("api/reports/userstype/{dietTypeId}")]
        public async Task<IActionResult> GetUsertypeReport(Guid dietTypeId)
        {
            var result = await _reportService.GetUsertypeReport(dietTypeId);
            return MapToHttpResponse(result);
        }
    }
}