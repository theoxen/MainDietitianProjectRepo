namespace API.Data
{
    public class MetricsDto
    {
        public required Guid Id { get; set; } 
        public required float Bodyweight { get; set; }
        public required float FatMass { get; set; }
        public required float MuscleMass { get; set; }
        public required DateTime DateCreated { get; set; } 
        public required Guid UserId { get; set; }

    }
}