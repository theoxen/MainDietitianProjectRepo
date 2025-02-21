namespace API.Data
{
    public class Note
    {
        public Guid Id { get; set; } = new Guid();
        public string NoteText { get; set; } = string.Empty;
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        public Guid UserId { get; set; }

        public User? User { get; set; } // Navigation property
    }
}