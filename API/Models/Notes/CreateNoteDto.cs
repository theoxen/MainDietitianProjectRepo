namespace API.Models.Notes
{
    public class CreateNoteDto
    {
        public string NoteText { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }
}