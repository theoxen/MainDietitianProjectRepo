using API.Common;
using API.Data;
using API.Models.Reports;
using API.Repositories.IRepositories;
using API.Services.IServices;

namespace API.Services
{
    // Service class responsible for handling all report-related operations
    public class ReportService : IReportService
    {
        // Repository dependency for data access
        private readonly IReportRepository _reportRepository;

        // Constructor with dependency injection
        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        // Retrieves users within a specified age range and their associated data
        // Returns a Result containing a list of ReportsViewDto or NotFound if no data exists
        public async Task<Result<List<ReportsViewDto>>> GetAgeGroupReport(int agestart, int ageend)
        {
            var result = await _reportRepository.GetAgeGroupReport(agestart, ageend);
            // Check if we got any results back
            if (result == null || !result.Any())
            {
                return Result<List<ReportsViewDto>>.NotFound();
            }
            // Map the repository results to DTOs, including nested Metrics and Appointments
            var usersViews = result.Select(result => new ReportsViewDto
            {
                // Basic user information mapping
                FullName = result.FullName,
                Gender = result.Gender,
                Height = result.Height,
                DietTypeId = result.DietTypeId,
                DietType = result.DietType,
                DateOfBirth = result.DateOfBirth,
                DateCreated = result.DateCreated,
                UserRoles = result.UserRoles,
                // Map associated metrics data, returns empty list if null
                Metrics = result.Metrics.Select(m => new MetricsDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Bodyweight = m.Bodyweight,
                    FatMass = m.FatMass,
                    MuscleMass = m.MuscleMass,
                    DateCreated = m.DateCreated
                }).ToList() ?? new List<MetricsDto>(),
                // Map associated appointments data, returns empty list if null
                Appointments = result.Appointments.Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentDate = a.AppointmentDate,
                    DateCreated = a.DateCreated,
                    UserId = a.UserId
                }).ToList() ?? new List<AppointmentDto>(),
                }).ToList();
            return Result<List<ReportsViewDto>>.Ok(usersViews);
        }

        // Retrieves appointments within a specified date range
        // Returns a Result containing a list of AppointmentDto or NotFound if no data exists
        public async Task<Result<List<AppointmentDto>>> GetAppointmentReport(DateOnly datestart, DateOnly dateend)
        {
            var result = await _reportRepository.GetAppointmentReport(datestart, dateend);
            if (result == null)
            {
                return Result<List<AppointmentDto>>.NotFound();
            }
            // Map appointment data to DTOs
            var appointmentViews = result.Select(result => new AppointmentDto
            {
                Id = result.Id,
                AppointmentDate = result.AppointmentDate,
                DateCreated = result.DateCreated,
                UserId = result.UserId
            }).ToList() ?? new List<AppointmentDto>();
            return Result<List<AppointmentDto>>.Ok(appointmentViews);
        }

        // Retrieves users who registered within a specified date range and their associated data
        // Returns a Result containing a list of ReportsViewDto or NotFound if no data exists
        public async Task<Result<List<ReportsViewDto>>> GetUsersReport(DateOnly datestart, DateOnly dateend)
        {
            // Similar structure to GetAgeGroupReport but filters by registration date range
            var result = await _reportRepository.GetUsersReport(datestart, dateend);
            if (result == null || !result.Any())
            {
                return Result<List<ReportsViewDto>>.NotFound();
            }
            // Map user data including metrics and appointments
            var usersViews = result.Select(result => new ReportsViewDto
            {
                // Basic user information mapping
                FullName = result.FullName,
                Gender = result.Gender,
                Height = result.Height,
                DietTypeId = result.DietTypeId,
                DietType = result.DietType,
                DateOfBirth = result.DateOfBirth,
                DateCreated = result.DateCreated,
                UserRoles = result.UserRoles,
                // Map associated metrics data, returns empty list if null
                Metrics = result.Metrics.Select(m => new MetricsDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Bodyweight = m.Bodyweight,
                    FatMass = m.FatMass,
                    MuscleMass = m.MuscleMass,
                    DateCreated = m.DateCreated
                }).ToList() ?? new List<MetricsDto>(),
                // Map associated appointments data, returns empty list if null
                Appointments = result.Appointments.Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentDate = a.AppointmentDate,
                    DateCreated = a.DateCreated,
                    UserId = a.UserId
                }).ToList() ?? new List<AppointmentDto>(),
                }).ToList();
            return Result<List<ReportsViewDto>>.Ok(usersViews);
        }

        // Retrieves users of a specific diet type and their associated data
        // Returns a Result containing a list of ReportsViewDto or NotFound if no data exists
        public async Task<Result<List<ReportsViewDto>>> GetUsertypeReport(Guid dietTypeId)
        {
            // Similar structure to other report methods but filters by diet type
            var result = await _reportRepository.GetUsertypeReport(dietTypeId);
            if (result == null || !result.Any())
            {
                return Result<List<ReportsViewDto>>.NotFound();
            }
            // Map user data including metrics and appointments
            var usersViews = result.Select(result => new ReportsViewDto
            {
                // Basic user information mapping
                FullName = result.FullName,
                Gender = result.Gender,
                Height = result.Height,
                DietTypeId = result.DietTypeId,
                DietType = result.DietType,
                DateOfBirth = result.DateOfBirth,
                DateCreated = result.DateCreated,
                UserRoles = result.UserRoles,
                // Map associated metrics data, returns empty list if null
                Metrics = result.Metrics.Select(m => new MetricsDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Bodyweight = m.Bodyweight,
                    FatMass = m.FatMass,
                    MuscleMass = m.MuscleMass,
                    DateCreated = m.DateCreated
                }).ToList() ?? new List<MetricsDto>(),
                // Map associated appointments data, returns empty list if null
                Appointments = result.Appointments.Select(a => new AppointmentDto
                {
                    Id = a.Id,
                    AppointmentDate = a.AppointmentDate,
                    DateCreated = a.DateCreated,
                    UserId = a.UserId
                }).ToList() ?? new List<AppointmentDto>(),
                }).ToList();
            return Result<List<ReportsViewDto>>.Ok(usersViews);
        }
    }
}