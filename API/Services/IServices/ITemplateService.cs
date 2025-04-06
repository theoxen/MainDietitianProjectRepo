using API.Common;
using API.Models.Templates;
using Microsoft.AspNetCore.Mvc;

namespace API.Services.IServices
{
    public interface ITemplateService
    {
        public Task<Result<TemplateDto>> CreateTemplateAsync(CreateTemplateDto createTemplateDto);
    }
}