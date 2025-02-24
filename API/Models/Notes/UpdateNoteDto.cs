namespace API.Models.Notes
{
    public class UpdateNoteDto
    {
        public required Guid Id { get; set; }
        public string NoteText { get; set; } = string.Empty;
    }
}