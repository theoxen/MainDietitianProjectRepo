namespace API.Models.Advice
{
    public class UpdateAdviceDto
    {
        public required Guid Id { get; set; }
        public string Tilte { get; set; } = string.Empty;
        public string AdviceText { get; set; } = string.Empty;
    }
}