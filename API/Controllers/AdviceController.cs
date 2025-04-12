using API.Models.Advice;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class AdviceController : BaseApiController
    {
        private readonly IAdviceService _adviceService;

        public AdviceController(IAdviceService adviceService)
        {
            _adviceService = adviceService;
        }

        [Authorize(Roles = "admin")] // Only admin can create advice
        [HttpPost(Endpoints.Advice.Create)] //POST http://localhost:5207/api/advice/create
        public async Task<IActionResult> CreateAdviceAsync(CreateAdviceDto createAdviceDto)     //{"Title": "Actual Title", 
        {                                                                                       // "AdviceText": "Actual Advice Text"}
            var result = await _adviceService.CreateAdviceAsync(createAdviceDto);
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Advice.Delete)] // DEL http://localhost:5207/api/advice/059f4439-7cc0-475c-0281-08dd5679c74b
        public async Task<IActionResult> DeleteAdviceAsync(Guid adviceId)
        {
            var result = await _adviceService.DeleteAdviceAsync(adviceId);
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin, client")]
        [HttpGet(Endpoints.Advice.GetAdvice)] // GET http://localhost:5207/api/advice/059f4439-7cc0-475c-0281-08dd5679c74b
        public async Task<IActionResult> GetAdviceAsync(Guid adviceId)
        {
            var result = await _adviceService.GetAdviceAsync(adviceId);
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Advice.UpdateAdvice)] // PUT http://localhost:5207/api/advice      
        public async Task<IActionResult> UpdateAdviceAsync(UpdateAdviceDto updateAdviceDto)   //{"id": "059f4439-7cc0-475c-0281-08dd5679c74b",
        {                                                                                     //"title": "Updated Title",                                                            
            var result = await _adviceService.UpdateAdviceAsync(updateAdviceDto);             //"adviceText": "Updated Advice Text"}
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin, client")] // Only admin and client can get all advice
        [HttpGet(Endpoints.Advice.GetAll)] // GET http://localhost:5207/api/advice
        public async Task<IActionResult> GetAllAdviceAsync()
        {
        var result = await _adviceService.GetAllAdviceAsync();
        return MapToHttpResponse(result);
        }

        [Authorize(Roles = "admin, client")]
        [HttpGet(Endpoints.Advice.Search)] // GET http://localhost:5207/api/advice/search?searchTerm=yourSearchTerm 
        public async Task<IActionResult> SearchAdviceAsync([FromQuery] string searchTerm)     //search term can be lower or upper case just be in the title
        {
            var result = await _adviceService.SearchAdviceAsync(searchTerm);
            return MapToHttpResponse(result);
        }
    }
}