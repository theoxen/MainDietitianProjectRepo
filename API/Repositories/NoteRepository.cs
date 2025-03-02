using API.Common;
using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly DataContext _dataContext;

        public NoteRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<bool> HasNoteAsync(Guid userId)
        {
            var note = await _dataContext.Notes.FirstOrDefaultAsync(x => x.UserId == userId);
            if (note == null)
            {
                return false;
            }
            return true;
        }

        public void CreateNote(Note note)
        {
            _dataContext.Notes.Add(note);
        }

        public void DeleteNote(Note note)
        {
            _dataContext.Notes.Remove(note);
        }

        public async Task<Note?> GetNoteAsync(Guid noteId)
        {
            var note = await _dataContext.Notes.FirstOrDefaultAsync(x => x.Id == noteId);
            return note;
        }
        
        public async Task<Note?> GetNoteByUserIdAsync(Guid userId)
        {
            var note = await _dataContext.Notes.FirstOrDefaultAsync(x => x.UserId == userId);
            return note;
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }

    }
}