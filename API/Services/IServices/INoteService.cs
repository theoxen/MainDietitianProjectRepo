using API.Common;
using API.Models.Notes;

namespace API.Services.IServices
{
    public interface INoteService
    {
        public Task<Result<NoteDto>> CreateNoteAsync(CreateNoteDto createNoteDto);
        public Task<Result<Empty>> DeleteNoteAsync(Guid noteId);
        public Task<Result<NoteDto>> GetNoteAsync(Guid userId);
        public Task<Result<NoteDto>> UpdateNoteAsync(UpdateNoteDto updateNoteDto);
    }
}