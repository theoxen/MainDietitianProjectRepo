namespace API.Data
{
    public class Review
    {
        public Guid Id { get; set; } = new Guid();
        public string? ReviewText { get; set; }
        public int Stars { get; set; }
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        public string? UserFullName { get; set; } // Can be anonymous
        public Guid? UserId { get; set; }
        public User? User { get; set; } // Navigation property
    }
}