namespace API.Models.Articles
{
    public class ArticleDto
    {
        public required Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string Link { get; set; }
        public required DateTime DateCreated { get; set; }
    }
}