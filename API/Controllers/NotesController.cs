using API.Models.Notes;
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

        [HttpDelete(Endpoints.Notes.Delete)] // url example: http://localhost:5207/api/notes/69de298f-9b71-4bda-2121-08dd57fdddcd
        public async Task<IActionResult> DeleteNoteAsync(Guid noteId)
        {
            var result = await _noteService.DeleteNoteAsync(noteId);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Notes.GetNote)] // url example: http://localhost:5207/api/notes/69de298f-9b71-4bda-2121-08dd57fdddcd
        public async Task<IActionResult> GetNoteAsync(Guid noteId)
        {
            var result = await _noteService.GetNoteAsync(noteId);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Users.GetNoteByUserId)] // /users/{userId}/note
        public async Task<IActionResult> GetNoteByUserIdAsync(Guid userId)
        {
            var result = await _noteService.GetNoteByUserIdAsync(userId);
            return MapToHttpResponse(result);
        }

        [HttpPut(Endpoints.Notes.UpdateNote)] // UPDATE IS HTTP PUT!
        public async Task<IActionResult> UpdateNoteAsync(UpdateNoteDto updateNoteDto)
        {
            var result = await _noteService.UpdateNoteAsync(updateNoteDto);
            return MapToHttpResponse(result);
        }
    }
}