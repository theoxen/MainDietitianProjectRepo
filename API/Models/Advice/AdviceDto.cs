namespace API.Models.Advice
{
    public class AdviceDto
    {
        public required Guid Id { get; set; }
        public required string Title { get; set; }
        public required string AdviceText { get; set; }
        public required DateTime DateCreated { get; set; }
       
    }
}