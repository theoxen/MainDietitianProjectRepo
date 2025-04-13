using API.Models.Templates;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
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

        [Authorize(Roles = "admin")]
        [HttpPost(Endpoints.Templates.Create)]
        public async Task<IActionResult> CreateTemplateAsync(CreateTemplateDto createTemplateDto)
        {
            var result = await _templateService.CreateTemplateAsync(createTemplateDto);
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Templates.Update)]
        public async Task<IActionResult> UpdateTemplateAsync(UpdateTemplateDto updateTemplateDto)
        {
            var result = await _templateService.UpdateTemplateAsync(updateTemplateDto);
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin")]
        [HttpGet(Endpoints.Templates.GetById)]
        public async Task<IActionResult> GetTemplateByIdAsync(Guid id)
        {
            var result = await _templateService.GetTemplateByIdAsync(id);
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin")]
        [HttpGet(Endpoints.Templates.GetAll)]
        public async Task<IActionResult> GetAllTemplatesAsync()
        {
            var result = await _templateService.GetAllTemplatesBriefAsync();
            return MapToHttpResponse(result);
        }


        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Templates.Delete)]
        public async Task<IActionResult> DeleteTemplateAsync(Guid id)
        {
            var result = await _templateService.DeleteTemplateAsync(id);
            return MapToHttpResponse(result);
        }
    }
}