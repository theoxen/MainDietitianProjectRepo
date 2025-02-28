namespace API.Models.Metrics
{
    public class EditMetricsDto
    {
        public required Guid metricsId { get; set; } 
        public required float Bodyweight { get; set; }
        public required float FatMass { get; set; }
        public required float MuscleMass { get; set; }
    }  
}
