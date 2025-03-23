using API.Common;
using API.Data;

namespace API.Services.IServices
{
    public interface IReportService
    {
        public Task<Result<List<User>>> GetUsersReport(DateOnly datestart, DateOnly dateend);

        public Task<Result<List<User>>> GetAgeGroupReport(int agestart, int ageend);

        public Task<Result<List<Appointment>>> GetAppointmentReport(DateOnly datestart, DateOnly dateend);

        public Task<Result<List<User>>> GetUsertypeReport(Guid dietTypeId);
    }
}