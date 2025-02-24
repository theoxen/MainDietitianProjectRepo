using API.Common;
using API.Models.Notes;

namespace API.Services.IServices
{
    public interface INoteService
    {
        public Task<Result<Empty>> CreateNoteAsync(CreateNoteDto createNoteDto);
    }
}