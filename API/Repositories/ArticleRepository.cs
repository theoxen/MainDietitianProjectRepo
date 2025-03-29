using API.Data;
using API.Models.Articles;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class ArticleRepository : IArticleRepository
    {
        private readonly DataContext _dataContext;
        public ArticleRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<Article?> GetArticleByIdAsync(Guid id)
        {
            return await _dataContext.Articles.FirstOrDefaultAsync(a => a.Id == id);
        }
        
        public void CreateArticle(Article article)
        {
            _dataContext.Articles.Add(article);
        }
        
        public void DeleteArticle(Article article)
        {
            _dataContext.Articles.Remove(article);
        }

        public async Task<List<Article>> GetAllArticlesAsync()
        {
            return await _dataContext.Articles.ToListAsync();
        }

        public async Task<List<Article>> SearchArticlesAsync(string searchTerm)
        {
            return await _dataContext.Articles
                .Where(a => a.Title.Contains(searchTerm))
                .ToListAsync();
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}