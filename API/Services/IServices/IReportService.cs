using API.Common;
using API.Data;
using API.Models.Reports;

namespace API.Services.IServices
{
    public interface IReportService
    {
        public Task<Result<List<ReportsViewDto>>> GetUsersReport(DateOnly datestart, DateOnly dateend);

        public Task<Result<List<ReportsViewDto>>> GetAgeGroupReport(int agestart, int ageend);

        public Task<Result<List<AppointmentDto>>> GetAppointmentReport(DateOnly datestart, DateOnly dateend);

        public Task<Result<List<ReportsViewDto>>> GetUsertypeReport(Guid dietTypeId);
    }
}