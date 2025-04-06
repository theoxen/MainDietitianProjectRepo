namespace API.Data
{
    public class Article
    {
        public Guid Id { get; set; } = new Guid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public DateTime DateCreated { get; set; } = DateTime.Now;
    }
}