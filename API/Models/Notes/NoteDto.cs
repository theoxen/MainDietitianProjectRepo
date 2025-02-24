namespace API.Models.Notes
{
    public class NoteDto
    {
        public required Guid Id { get; set; }
        public required string NoteText { get; set; }
        public required DateTime DateCreated { get; set; }
        public required Guid UserId { get; set; }
    }
}