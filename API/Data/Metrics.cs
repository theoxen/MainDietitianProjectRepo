namespace API.Data
{
    public class Metrics
    {
        public Guid Id { get; set; } = new Guid();
        public float Bodyweight { get; set; }
        public float FatMass { get; set; }
        public float MuscleMass { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        public Guid UserId { get; set; }

        public User? User { get; set; } // Navigation property
    }
}