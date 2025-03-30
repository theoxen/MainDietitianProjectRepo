using API.Data;
using API.Models.Articles;

namespace API.Repositories.IRepositories
{
    public interface IArticleRepository : IBaseRepository
    {
        public Task<Article?> GetArticleByIdAsync(Guid id);
        public void CreateArticle(Article article);
        public void DeleteArticle(Article article);
        public Task<List<Article>> GetAllArticlesAsync();
        public Task<List<Article>> SearchArticlesAsync(string searchTerm);
    }
}