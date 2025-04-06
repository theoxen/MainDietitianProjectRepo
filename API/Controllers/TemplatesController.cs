using API.Models.Templates;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class TemplatesController : BaseApiController
    {
        private readonly ITemplateService _templateService;

        public TemplatesController(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        [HttpPost(Endpoints.Templates.Create)]
        public async Task<IActionResult> CreateTemplateAsync(CreateTemplateDto createTemplateDto)
        {
            var result = await _templateService.CreateTemplateAsync(createTemplateDto);
            return MapToHttpResponse(result);
        }
    }
}