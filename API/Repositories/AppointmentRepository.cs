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

        public void MakeAnAppointment(Appointment appointment)
        {
            _dataContext.Appointments.Add(appointment);
        }

        public void CancelAppointment(Appointment appointment)
        {
             _dataContext.Appointments.Remove(appointment); 
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }

        
       public async Task<List<Appointment>> SearchAppointmentsAsync(DateTime? date)
        {
            var query = _dataContext.Appointments.AsQueryable();

            if (date.HasValue && date.Value != DateTime.MinValue)
            {
                query = query.Where(m => m.DateCreated.Date == date.Value.Date);
            }

            return await query.ToListAsync();
        }
        

        public async Task<Appointment?> GetAppointmentAsync(Guid appointmentId)
        {
            var appointment = await _dataContext.Appointments.FirstOrDefaultAsync(x => x.Id == appointmentId);
            return appointment;
        }

    }
}