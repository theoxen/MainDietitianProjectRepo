using API.Common;
using API.Data;
using API.Models.Notes;
using API.Repositories.IRepositories;
using API.Services.IServices;
using Microsoft.AspNetCore.Identity;

namespace API.Services
{
    public class NoteService : INoteService
    {
        private readonly UserManager<User> _userManager;
        private readonly INoteRepository _noteRepository;

        public NoteService(UserManager<User> userManager, INoteRepository noteRepository)
        {
            _userManager = userManager;
            _noteRepository = noteRepository;
        }
        public async Task<Result<Empty>> CreateNoteAsync(CreateNoteDto createNoteDto)
        {
            var user = await _userManager.FindByIdAsync(createNoteDto.UserId.ToString());
            if (user == null)
            {
                return Result<Empty>.NotFound();
            }

            var note = new Note
            {
                NoteText = createNoteDto.NoteText,
                UserId = createNoteDto.UserId,
                User = user
            };

            var result = await _noteRepository.CreateNoteAsync(note);

            if (result)
            {
                return Result<Empty>.Ok(new Empty());
            }

            List<ResultError> errors = new();
            errors.Add(new ResultError{
                Identifier = "FailedCreatingNote",
                Message =  "Failed to create note"
            });
            
            return Result<Empty>.BadRequest(errors);
        }
    }
}