using API.Data;
using API.Repositories.IRepositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    // Repository handling all database operations for generating administrative reports
    // Implements IReportRepository for dependency injection pattern
    public class ReportRepository : IReportRepository
    {
        // Database context for Entity Framework operations
        private readonly DataContext _dataContext;
        // User management functionality from ASP.NET Identity
        private readonly UserManager<User> userManager;

        // Constructor with dependency injection for database and user management
        public ReportRepository(DataContext dataContext, UserManager<User> userManager)
        {
            _dataContext = dataContext;
            this.userManager = userManager;
        }

        // Retrieves users who registered within a specified date range
        // Includes related data (Metrics, Appointments, UserDiets) for complete reporting
        public async Task<List<User>> GetUsersReport(DateOnly datestart, DateOnly dateend)
        {
            // Convert DateOnly to DateTime for database comparison
            DateTime startDateTime = datestart.ToDateTime(TimeOnly.MinValue);
            DateTime endDateTime = dateend.ToDateTime(TimeOnly.MaxValue);

            return await _dataContext.Users
                .Include(u => u.Metrics)     // Load user's measurement history
                .Include(u => u.Appointments)// Load user's appointment history
                .Include(u => u.UserDiets)   // Load user's diet plan information
                .Where(x => x.DateCreated >= startDateTime && x.DateCreated <= endDateTime)
                .ToListAsync();
        }

        // Retrieves users within a specific age range
        // Uses complex age calculation to ensure accurate filtering
        public async Task<List<User>> GetAgeGroupReport(int agestart, int ageend)
        {
            DateTime today = DateTime.Today;

            return await _dataContext.Users
                .Include(u => u.Metrics)     // Load measurement data
                .Include(u => u.Appointments)// Load appointment history
                .Include(u => u.UserDiets)   // Load diet information
                // Complex age calculation considering birth month and day
                .Where(x => 
                    (today.Year - x.DateOfBirth.Year - (today.DayOfYear < x.DateOfBirth.DayOfYear ? 1 : 0)) >= agestart &&
                    (today.Year - x.DateOfBirth.Year - (today.DayOfYear < x.DateOfBirth.DayOfYear ? 1 : 0)) <= ageend)
                .ToListAsync();
        }

        // Retrieves appointments scheduled within a date range
        // Used for analyzing appointment patterns and scheduling trends
        public async Task<List<Appointment>> GetAppointmentReport(DateOnly datestart,DateOnly dateend)
        {
            // Convert DateOnly to DateTime for database queries
            DateTime startDateTime = datestart.ToDateTime(TimeOnly.MinValue);
            DateTime endDateTime = dateend.ToDateTime(TimeOnly.MaxValue);

            return await _dataContext.Appointments
                .Where(x => x.AppointmentDate >= startDateTime && x.AppointmentDate <= endDateTime)
                .ToListAsync();
        }

        // Retrieves users following a specific diet type
        // Includes related data for comprehensive diet analysis
        public async Task<List<User>> GetUsertypeReport(Guid dietType)
        {
            return await _dataContext.Users
                .Include(u => u.Metrics)     // Include physical measurements
                .Include(u => u.Appointments)// Include scheduled appointments
                .Include(u => u.UserDiets)   // Include diet plan details
                .Where(x => x.DietTypeId == dietType)
                .ToListAsync();
        }

        // Saves pending changes to the database
        // Returns true if changes were saved successfully
        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}