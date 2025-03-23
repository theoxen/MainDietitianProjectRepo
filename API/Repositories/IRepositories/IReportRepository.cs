using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IReportRepository : IBaseRepository
    {
        public Task<List<User>> GetUsersReport(DateOnly datestart, DateOnly dateend);

        public Task<List<User>> GetAgeGroupReport(int agestart, int ageend);

        public Task<List<Appointment>> GetAppointmentReport(DateOnly datestart, DateOnly dateend);

        public Task<List<User>> GetUsertypeReport(Guid dietTypeId);
    }
}