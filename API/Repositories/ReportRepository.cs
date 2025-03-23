using API.Data;
using API.Repositories.IRepositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly DataContext _dataContext;
        private readonly UserManager<User> userManager;

        public ReportRepository(DataContext dataContext, UserManager<User> userManager)
        {
            _dataContext = dataContext;

            this.userManager = userManager;
        }

        public async Task<List<User>> GetUsersReport(DateOnly datestart, DateOnly dateend)
        {
            DateTime startDateTime = datestart.ToDateTime(TimeOnly.MinValue);
            DateTime endDateTime = dateend.ToDateTime(TimeOnly.MaxValue);

            return await _dataContext.Users
                .Where(x => x.DateCreated >= startDateTime && x.DateCreated <= endDateTime)
                .ToListAsync();
        }

        

        public async Task<List<User>> GetAgeGroupReport(int agestart, int ageend)
        {
            DateTime today = DateTime.Today;

            return await _dataContext.Users
                .Where(x => 
                    (today.Year - x.DateOfBirth.Year - (today.DayOfYear < x.DateOfBirth.DayOfYear ? 1 : 0)) >= agestart &&
                    (today.Year - x.DateOfBirth.Year - (today.DayOfYear < x.DateOfBirth.DayOfYear ? 1 : 0)) <= ageend)
                .ToListAsync();
        }



        public async Task<List<Appointment>> GetAppointmentReport(DateOnly datestart,DateOnly dateend)
        {
            DateTime startDateTime = datestart.ToDateTime(TimeOnly.MinValue);
            DateTime endDateTime = dateend.ToDateTime(TimeOnly.MaxValue);

            return await _dataContext.Appointments
                .Where(x => x.AppointmentDate >= startDateTime && x.AppointmentDate <= endDateTime)
                .ToListAsync();
        }




        public async Task<List<User>> GetUsertypeReport(Guid dietType)
        {
            return await _dataContext.Users
                .Where(x => x.DietTypeId == dietType)
                .ToListAsync();
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}