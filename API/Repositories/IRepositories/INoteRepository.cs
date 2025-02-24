using API.Common;
using API.Data;

namespace API.Repositories.IRepositories
{
    public interface INoteRepository : IBaseRepository
    {
        public Task<bool> HasNoteAsync(Guid userId);
        public void CreateNote(Note note);
        public void DeleteNote(Note note);
        public Task<Note?> GetNoteAsync(Guid noteId);
    }
}