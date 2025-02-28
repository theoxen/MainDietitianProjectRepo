namespace API.Data
{    public class Advice
    {
        public Guid Id { get; set; } = new Guid();
        public string Title { get; set; } = string.Empty;
        public string AdviceText { get; set; } = string.Empty;
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    }
}