using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly DataContext _dataContext;
        public AppointmentRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public void MakeAnAppointment(Appointment appointment) // enters a new appointment in the db
        {
            _dataContext.Appointments.Add(appointment);
        }

        public void CancelAppointment(Appointment appointment) // removes an appointment from the db
        {
             _dataContext.Appointments.Remove(appointment); 
        }

        public async Task<bool> Commit() // if changes are more than 0 it commits the changes to the db
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }

        
       public async Task<List<Appointment>> SearchAppointmentsAsync(DateTime? date) // searches an appointment from the db if theres a date, else it just brings everything
        {
            var query = _dataContext.Appointments.AsQueryable();

            if (date.HasValue && date.Value != DateTime.MinValue)
            {
                query = query.Where(m => m.DateCreated.Date == date.Value.Date);
            }

            return await query.ToListAsync();
        }
        

        public async Task<Appointment?> GetAppointmentAsync(Guid appointmentId) // gets an appointment from the db with the appointmentID
        {
            var appointment = await _dataContext.Appointments.FirstOrDefaultAsync(x => x.Id == appointmentId);
            return appointment;
        }

    }
}