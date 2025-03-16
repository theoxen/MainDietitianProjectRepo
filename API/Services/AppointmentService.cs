using API.Common;
using API.Data;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Identity;

namespace API.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly UserManager<User> _userManager;
        private readonly IAppointmentRepository _appointmentRepository;
        
        public AppointmentService(UserManager<User> userManager, IAppointmentRepository appointmentRepository)
        {
            _userManager = userManager;
            _appointmentRepository = appointmentRepository;

        }


        public async Task<Result<AppointmentDto>> MakeAnAppointmentAsync(MakeAnAppointmentDto MakeAnAppointmentDto)
        {
            var user = await _userManager.FindByIdAsync(MakeAnAppointmentDto.UserId.ToString());
            if (user == null) // If the given userid is not found in the database
            {
                return Result<AppointmentDto>.NotFound();
            }

            var appointment = new Appointment
            {
                AppointmentDate = MakeAnAppointmentDto.AppointmentDate,   
                User = user
            };

            _appointmentRepository.MakeAnAppointment(appointment);

            if(await _appointmentRepository.Commit())
            {
                return Result<AppointmentDto>.Ok(new AppointmentDto
                {
                    Id = appointment.Id,
                    DateCreated = appointment.DateCreated,
                    AppointmentDate = appointment.AppointmentDate,
                    UserId = appointment.UserId
                }

                );
            }

            return Result<AppointmentDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedToMakeAnAppointment",
                    Message = "Failed To Make An Appointment"
                }
            });
            
        }

        public async Task<Result<Empty>> CancelAppointmentAsync(Guid AppointmentsId)
        {
             var appointment = await _appointmentRepository.GetAppointmentAsync(AppointmentsId);

            if (appointment is null) // If the user does not have appointment in the database dont let the admin delete them.
            {
                return Result<Empty>.NotFound();
            }

            _appointmentRepository.CancelAppointment(appointment);

            if(await _appointmentRepository.Commit()) // Committing the chagnes to the database
            {
                return Result<Empty>.Ok(new Empty());
            }
            
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedCancelingAppointment",
                    Message = "Failed Canceling Appointment"
                }
            });
        }

        public async Task<Result<List<AppointmentDto>>> SearchAppointmentsAsync(DateTime? date)
        {
             var appointments = await _appointmentRepository.SearchAppointmentsAsync(date);
            if (appointments == null || !appointments.Any())
            {
                return Result<List<AppointmentDto>>.NotFound();
            }

            var appointmentDtoList = appointments.Select(m => new AppointmentDto
            {
                Id = m.Id,
                AppointmentDate = m.AppointmentDate,
                DateCreated = m.DateCreated,
                UserId = m.UserId
            }).ToList();

            return Result<List<AppointmentDto>>.Ok(appointmentDtoList);
        }

        public async Task<Result<AppointmentDto>> ViewAppointmetsAsync(Guid AppointmentsId)
        {
            // Retrieve the metrics entry from the database using the provided metrics ID
            var appointments = await _appointmentRepository.GetAppointmentAsync(AppointmentsId);
            
            // Check if the metrics entry was found
            if (appointments == null)
            {
                // If not found, return a NotFound result
                return Result<AppointmentDto>.NotFound();
            }

            // Return the metrics data in a MetricsDto object
            return Result<AppointmentDto>.Ok(new AppointmentDto
            {
                Id = appointments.Id,
                AppointmentDate = appointments.AppointmentDate,
                DateCreated = appointments.DateCreated,
                UserId = appointments.UserId
            });
        }
    }
}