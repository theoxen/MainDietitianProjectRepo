using API.Common;
using API.Data;
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



        public async Task<Result<List<User>>> GetAgeGroupReport(int agestart, int ageend)
        {
            var result = await _reportRepository.GetAgeGroupReport(agestart, ageend);
            if (result == null)
            {
                return Result<List<User>>.NotFound();
            }
            return Result<List<User>>.Ok(result);
        }

        public async Task<Result<List<Appointment>>> GetAppointmentReport(DateOnly datestart, DateOnly dateend)
        {
            var result = await _reportRepository.GetAppointmentReport(datestart, dateend);
            if (result == null)
            {
                return Result<List<Appointment>>.NotFound();
            }
            return Result<List<Appointment>>.Ok(result);
        }

        public async Task<Result<List<User>>> GetUsersReport(DateOnly datestart, DateOnly dateend)
        {
            
            var result = await _reportRepository.GetUsersReport(datestart, dateend);
            if (result == null)
            {
                return Result<List<User>>.NotFound();
            }
            return Result<List<User>>.Ok(result);
        }

        public async Task<Result<List<User>>> GetUsertypeReport(Guid dietTypeId)
        {
            var result = await _reportRepository.GetUsertypeReport(dietTypeId);
            if (result == null)
            {
                return Result<List<User>>.NotFound();
            }
            return Result<List<User>>.Ok(result);
        }
    }
}