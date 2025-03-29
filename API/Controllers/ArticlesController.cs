using API.Models.Articles;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ArticlesController : BaseApiController
    {
        private readonly IArticleService _articleService;

        public ArticlesController(IArticleService articleService)
        {
            _articleService = articleService;
        }

        [HttpGet(Endpoints.Articles.GetById)]
        public async Task<IActionResult> GetArticleByIdAsync(Guid id)
        {
            var result = await _articleService.GetArticleByIdAsync(id);
            return MapToHttpResponse(result);
        }

        [HttpPost(Endpoints.Articles.Create)]
        public async Task<IActionResult> CreateArticleByIdAsync(CreateArticleDto createArticleDto)
        {
            var result = await _articleService.CreateArticleAsync(createArticleDto);
            return MapToHttpResponse(result);
        }

        [HttpPut(Endpoints.Articles.Update)]
        public async Task<IActionResult> UpdateArticleByIdAsync(UpdateArticleDto updateArticleDto)
        {
            var result = await _articleService.UpdateArticleAsync(updateArticleDto);
            return MapToHttpResponse(result);
        }

        [HttpDelete(Endpoints.Articles.Delete)]
        public async Task<IActionResult> DeleteArticleByIdAsync(Guid id)
        {
            var result = await _articleService.DeleteArticleAsync(id);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Articles.GetAll)]
        public async Task<IActionResult> GetAllArticlesAsync()
        {
            var result = await _articleService.GetAllArticlesAsync();
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Articles.Search)]
        public async Task<IActionResult> SearchArticlesAsync(string searchTerm)
        {
            var result = await _articleService.SearchArticlesAsync(searchTerm);
            return MapToHttpResponse(result);
        }
    }
}