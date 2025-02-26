using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Models.Advice;
using API.Services.IServices;
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

        [HttpPost]
        public async Task<IActionResult> CreateAdviceAsync(CreateAdviceDto createAdviceDto)
        {
            var result = await _adviceService.CreateAdviceAsync(createAdviceDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete("{adviceId}")]
        public async Task<IActionResult> DeleteAdviceAsync(Guid adviceId)
        {
            var result = await _adviceService.DeleteAdviceAsync(adviceId);
            return MapToHttpResponse(result);
        }

        [HttpGet("{adviceId}")]
        public async Task<IActionResult> GetAdviceAsync(Guid adviceId)
        {
            var result = await _adviceService.GetAdviceAsync(adviceId);
            return MapToHttpResponse(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAdviceAsync()
        {
            var result = await _adviceService.GetAllAdviceAsync();
            return MapToHttpResponse(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAdviceAsync(UpdateAdviceDto updateAdviceDto)
        {
            var result = await _adviceService.UpdateAdviceAsync(updateAdviceDto);
            return MapToHttpResponse(result);
        }

        private IActionResult MapToHttpResponse<T>(Result<T> result)
        {
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            if (result.Status == ResultStatus.NotFound)
            {
                return NotFound(result.Errors);
            }

            return BadRequest(result.Errors);
        }
    }
}