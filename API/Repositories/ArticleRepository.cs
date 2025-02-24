using API.Data;
using API.Repositories.IRepositories;

namespace API.Repositories
{
    public class ArticleRepository : IArticleRepository
    {
        private readonly DataContext _dataContext;
        public ArticleRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}