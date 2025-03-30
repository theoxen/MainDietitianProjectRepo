using API.Common;
using API.Models.Articles;

namespace API.Services.IServices
{
    public interface IArticleService
    {
        public Task<Result<ArticleDto>> GetArticleByIdAsync(Guid id);
        public Task<Result<Empty>> CreateArticleAsync(CreateArticleDto createArticleDto);
        public Task<Result<ArticleDto>> UpdateArticleAsync(UpdateArticleDto updateArticleDto);
        public Task<Result<Empty>> DeleteArticleAsync(Guid id);
        public Task<Result<List<ArticleDto>>> GetAllArticlesAsync();
        public Task<Result<List<ArticleDto>>> SearchArticlesAsync(string searchTerm);
    }
}