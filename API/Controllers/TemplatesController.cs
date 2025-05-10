using API.Models.Templates;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    /// <summary>
    /// Controller responsible for managing template resources
    /// Handles CRUD operations for template entities
    /// All endpoints require admin authorization
    /// </summary>
    public class TemplatesController : BaseApiController
    {
        private readonly ITemplateService _templateService;

        /// <summary>
        /// Constructor using dependency injection to get the template service
        /// This pattern allows for loose coupling and easier testing
        /// </summary>
        public TemplatesController(ITemplateService templateService)
        {
            _templateService = templateService;
        }

        /// <summary>
        /// Creates a new template in the system
        /// POST endpoint that accepts template data via DTO
        /// Only accessible to users with admin role
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpPost(Endpoints.Templates.Create)]
        public async Task<IActionResult> CreateTemplateAsync(CreateTemplateDto createTemplateDto)
        {
            var result = await _templateService.CreateTemplateAsync(createTemplateDto);
            return MapToHttpResponse(result); // Maps service result to appropriate HTTP response
        }

        /// <summary>
        /// Updates an existing template with new information
        /// PUT endpoint that accepts updated template data
        /// Only accessible to users with admin role
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Templates.Update)]
        public async Task<IActionResult> UpdateTemplateAsync(UpdateTemplateDto updateTemplateDto)
        {
            var result = await _templateService.UpdateTemplateAsync(updateTemplateDto);
            return MapToHttpResponse(result); // Maps service result to appropriate HTTP response
        }

        /// <summary>
        /// Retrieves a single template by its unique identifier
        /// GET endpoint that requires a template ID
        /// Only accessible to users with admin role
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpGet(Endpoints.Templates.GetById)]
        public async Task<IActionResult> GetTemplateByIdAsync(Guid id)
        {
            var result = await _templateService.GetTemplateByIdAsync(id);
            return MapToHttpResponse(result); // Maps service result to appropriate HTTP response
        }

        /// <summary>
        /// Retrieves all templates in the system (brief version)
        /// GET endpoint that returns a collection of templates
        /// Only accessible to users with admin role
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpGet(Endpoints.Templates.GetAll)]
        public async Task<IActionResult> GetAllTemplatesAsync()
        {
            var result = await _templateService.GetAllTemplatesBriefAsync();
            return MapToHttpResponse(result); // Maps service result to appropriate HTTP response
        }

        /// <summary>
        /// Deletes a template from the system by its ID
        /// DELETE endpoint that requires a template ID
        /// Only accessible to users with admin role
        /// </summary>
        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Templates.Delete)]
        public async Task<IActionResult> DeleteTemplateAsync(Guid id)
        {
            var result = await _templateService.DeleteTemplateAsync(id);
            return MapToHttpResponse(result); // Maps service result to appropriate HTTP response
        }
    }
}