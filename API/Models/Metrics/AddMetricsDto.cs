namespace API.Models.Metric
{
    public class AddMetricsDto
    {
        public float BodyWeight { get; set; }
        public float FatMass { get; set; }
        public float MuscleMass { get; set; }
        public Guid UserId { get; set; }
    }
}
