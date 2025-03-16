using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IAppointmentRepository : IBaseRepository
    {
        public void MakeAnAppointment(Appointment appointment);
        public void CancelAppointment(Appointment appointment);
        public Task<List<Appointment>> SearchAppointmentsAsync(DateTime? date); // if date is null fetch all the appointments, if not null fetch the selected day's appointments 
        public Task<Appointment?> GetAppointmentAsync(Guid appointmentId);
    }
}