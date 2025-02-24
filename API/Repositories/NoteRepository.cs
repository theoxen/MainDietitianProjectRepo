using API.Common;
using API.Data;
using API.Repositories.IRepositories;

namespace API.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly DataContext _dataContext;

        public NoteRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }
        
        public async Task<bool> CreateNoteAsync(Note note)
        {
            await _dataContext.Notes.AddAsync(note);
            var result = await _dataContext.SaveChangesAsync();
            if (result > 0)
            {
                return true;
            }
            return false;  
        }
    }
}