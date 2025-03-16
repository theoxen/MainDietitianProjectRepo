namespace API.Data
{
    public class AppointmentDto
    {
        public required Guid Id { get; set; }
        public required DateTime AppointmentDate { get; set; }
        public required DateTime DateCreated { get; set; }
        public required Guid UserId { get; set; }
    }
}