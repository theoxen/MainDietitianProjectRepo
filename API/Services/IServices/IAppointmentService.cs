using API.Common;
using API.Data;

namespace API.Services.IServices
{
    public interface IAppointmentService
    {
        public Task<Result<AppointmentDto>> MakeAnAppointmentAsync(MakeAnAppointmentDto MakeAnAppointmentDto);
        // public Task<Result<AppointmentDto>> EditMetricsAsync(EditMetricsDto editMetricsDto); 
        public Task<Result<Empty>> CancelAppointmentAsync(Guid AppointmentsId); 
        public Task<Result<AppointmentDto>> ViewAppointmetsAsync(Guid AppointmentsId); 
        public Task<Result<List<AppointmentDto>>> SearchAppointmentsAsync(DateTime? date); // searches and displays specific's date metrics for the selected client 
    }
}