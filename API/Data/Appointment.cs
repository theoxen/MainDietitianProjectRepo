namespace API.Data
{
    public class Appointment
    {
        public Guid Id { get; set; } = new Guid();
        public DateTime AppointmentDate { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.Now;
        public Guid UserId { get; set; }
        public User? User { get; set; } // Navigation property
        
        // Constructor to initialize AppointmentDate without seconds
        public Appointment(int year, int month, int day, int hour, int minute, Guid userId)
        {
            AppointmentDate = new DateTime(year, month, day, hour, minute, 0);
            UserId = userId;
        }

        // Parameterless constructor (base constructor) for EF Core
        public Appointment() { }

    }
}