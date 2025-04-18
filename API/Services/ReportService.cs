using API.Common;
using API.Data;
using API.Models.Reports;
using API.Repositories.IRepositories;
using API.Services.IServices;

namespace API.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }


        public async Task<Result<List<ReportsViewDto>>> GetAgeGroupReport(int agestart, int ageend)
        {
            var result = await _reportRepository.GetAgeGroupReport(agestart, ageend);
            if (result == null || !result.Any())
            {
                return Result<List<ReportsViewDto>>.NotFound();
            }
            var usersViews = result.Select(result => new ReportsViewDto
            {
                FullName = result.FullName,
                Gender = result.Gender,
                Height = result.Height,
                DietTypeId = result.DietTypeId,
                DietType = result.DietType,
                DateOfBirth = result.DateOfBirth,
                DateCreated = result.DateCreated,
                UserRoles = result.UserRoles,
                Metrics = result.Metrics.Select(m => new MetricsDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Bodyweight = m.Bodyweight,
                    FatMass = m.FatMass,
                    MuscleMass = m.MuscleMass,
                    DateCreated = m.DateCreated
                }).ToList() ?? new List<MetricsDto>(),
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

        public async Task<Result<List<AppointmentDto>>> GetAppointmentReport(DateOnly datestart, DateOnly dateend)
        {
            var result = await _reportRepository.GetAppointmentReport(datestart, dateend);
            if (result == null)
            {
                return Result<List<AppointmentDto>>.NotFound();
            }
            var appointmentViews = result.Select(result => new AppointmentDto
            {
                Id = result.Id,
                AppointmentDate = result.AppointmentDate,
                DateCreated = result.DateCreated,
                UserId = result.UserId
            }).ToList() ?? new List<AppointmentDto>();
            return Result<List<AppointmentDto>>.Ok(appointmentViews);
        }

        public async Task<Result<List<ReportsViewDto>>> GetUsersReport(DateOnly datestart, DateOnly dateend)
        {
            
            var result = await _reportRepository.GetUsersReport(datestart, dateend);
            if (result == null || !result.Any())
            {
                return Result<List<ReportsViewDto>>.NotFound();
            }
            var usersViews = result.Select(result => new ReportsViewDto
                    {
                FullName = result.FullName,
                Gender = result.Gender,
                Height = result.Height,
                DietTypeId = result.DietTypeId,
                DietType = result.DietType,
                DateOfBirth = result.DateOfBirth,
                DateCreated = result.DateCreated,
                UserRoles = result.UserRoles,
                Metrics = result.Metrics.Select(m => new MetricsDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Bodyweight = m.Bodyweight,
                    FatMass = m.FatMass,
                    MuscleMass = m.MuscleMass,
                    DateCreated = m.DateCreated
                }).ToList() ?? new List<MetricsDto>(),
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

        public async Task<Result<List<ReportsViewDto>>> GetUsertypeReport(Guid dietTypeId)
        {
            var result = await _reportRepository.GetUsertypeReport(dietTypeId);
            if (result == null || !result.Any())
            {
                return Result<List<ReportsViewDto>>.NotFound();
            }
            var usersViews = result.Select(result => new ReportsViewDto
                    {
                FullName = result.FullName,
                Gender = result.Gender,
                Height = result.Height,
                DietTypeId = result.DietTypeId,
                DietType = result.DietType,
                DateOfBirth = result.DateOfBirth,
                DateCreated = result.DateCreated,
                UserRoles = result.UserRoles,
                Metrics = result.Metrics.Select(m => new MetricsDto
                {
                    Id = m.Id,
                    UserId = m.UserId,
                    Bodyweight = m.Bodyweight,
                    FatMass = m.FatMass,
                    MuscleMass = m.MuscleMass,
                    DateCreated = m.DateCreated
                }).ToList() ?? new List<MetricsDto>(),
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