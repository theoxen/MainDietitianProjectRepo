using API.Common;
using API.Data;

namespace API.Repositories.IRepositories
{
    public interface INoteRepository
    {
        public Task<bool> CreateNoteAsync(Note note);
    }
}