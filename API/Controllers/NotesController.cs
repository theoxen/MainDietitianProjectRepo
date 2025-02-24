using API.Models.Notes;
using API.Services;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class NotesController : BaseApiController
    {
        private readonly INoteService _noteService;
        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpPost(Endpoints.Notes.Create)]
        public async Task<IActionResult> CreateNoteAsync(CreateNoteDto createNoteDto)
        {
            var result = await _noteService.CreateNoteAsync(createNoteDto);
            return MapToHttpResponse(result);
        }
    }
}