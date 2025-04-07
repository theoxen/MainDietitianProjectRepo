using API.Common;
using API.Models.Templates;
using Microsoft.AspNetCore.Mvc;

namespace API.Services.IServices
{
    public interface ITemplateService
    {
        public Task<Result<TemplateDto>> CreateTemplateAsync(CreateTemplateDto createTemplateDto);
        public Task<Result<TemplateDto>> UpdateTemplateAsync(UpdateTemplateDto createTemplateDto);
        public Task<Result<TemplateDto>> GetTemplateByIdAsync(Guid id);
        public Task<Result<List<TemplateBriefDto>>> GetAllTemplatesBriefAsync(); // THE TEMPLATEBRIEFDTO IS A DTO THAT CONTAINS ONLY THE ID, NAME, DATECREATED (AND ISTEMPLATE) OF THE TEMPLATE, NOT THE FULL TEMPLATE. THAT'S WHAT WE WANT
        public Task<Result<Empty>> DeleteTemplateAsync(Guid id);
    }
}