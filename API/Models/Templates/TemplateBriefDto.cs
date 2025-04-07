namespace API.Models.Templates
{
    public class TemplateBriefDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsTemplate { get; set; }
        public DateTime DateCreated { get; set; }
    }
}