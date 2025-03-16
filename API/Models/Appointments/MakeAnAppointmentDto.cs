namespace API.Data
{
    public class MakeAnAppointmentDto
    {
        public DateTime AppointmentDate { get; set; }
        public Guid UserId { get; set; }

    }
}