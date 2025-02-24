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
        
        public async Task<Result<NoteDto>> CreateNoteAsync(CreateNoteDto createNoteDto)
        {
            var user = await _userManager.FindByIdAsync(createNoteDto.UserId.ToString());
            if (user == null) // If the given userid is not found in the database
            {
                return Result<NoteDto>.NotFound();
            }

            var hasNote = await _noteRepository.HasNoteAsync(createNoteDto.UserId);
            if (hasNote) // If the user already has a note in the database dont let the admin create another one.
            {
                return Result<NoteDto>.BadRequest(new List<ResultError>
                {
                    new ResultError
                    {
                        Identifier = "NoteAlreadyExists",
                        Message = "Note already exists"
                    }
                });
            }

            var note = new Note
            {
                NoteText = createNoteDto.NoteText,
                UserId = createNoteDto.UserId,
                User = user
            };

            _noteRepository.CreateNote(note);

            if (await _noteRepository.Commit()) // Committing the chagnes to the database
            {
                return Result<NoteDto>.Ok(new NoteDto
                {
                    Id = note.Id,
                    NoteText = note.NoteText,
                    DateCreated = note.DateCreated,
                    UserId = note.UserId
                });
            }

            return Result<NoteDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedCreatingNote",
                    Message = "Failed to create note"
                }
            });
        }

        public async Task<Result<Empty>> DeleteNoteAsync(Guid noteId)
        {
            var note = await _noteRepository.GetNoteAsync(noteId);
            if (note is null) // If the user does not have a note in the database dont let the admin delete it.
            {
                return Result<Empty>.NotFound();
            }

            _noteRepository.DeleteNote(note);
            if(await _noteRepository.Commit()) // Committing the chagnes to the database
            {
                return Result<Empty>.Ok(new Empty());
            }
            
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedDeletingNote",
                    Message = "Failed to delete note"
                }
            });
        }

        public async Task<Result<NoteDto>> GetNoteAsync(Guid noteId)
        {
            var note = await _noteRepository.GetNoteAsync(noteId);
            if (note == null)
            {
                return Result<NoteDto>.NotFound();
            }

            var returnedNoteDto = new NoteDto
            {
                Id = note.Id,
                NoteText = note.NoteText,
                DateCreated = note.DateCreated,
                UserId = note.UserId
            };

            return Result<NoteDto>.Ok(returnedNoteDto);
        }

        public async Task<Result<NoteDto>> UpdateNoteAsync(UpdateNoteDto updateNoteDto)
        {
            var note = await _noteRepository.GetNoteAsync(updateNoteDto.Id); // When we get the note from the database, dotnet tracks the changes. So when we change the note text, it will be updated in the database when we call await _noteRepository.Commit().
            if (note == null)
            {
                return Result<NoteDto>.NotFound();
            }

            note.NoteText = updateNoteDto.NoteText;

            if (await _noteRepository.Commit()) // Committing the chagnes to the database
            {
                return Result<NoteDto>.Ok(new NoteDto
                {
                    Id = note.Id,
                    NoteText = note.NoteText,
                    DateCreated = note.DateCreated,
                    UserId = note.UserId
                });
            }
            
            return Result<NoteDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedUpdatingNote",
                    Message = "Failed to update note"
                }
            });
        }
    }
}