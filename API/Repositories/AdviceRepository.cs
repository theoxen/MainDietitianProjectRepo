using API.Data;
using API.Common;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class AdviceRepository : IAdviceRepository
    {
        private readonly DataContext _dataContext;
        public AdviceRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public void CreateAdvice(Advice advice)
        {
            _dataContext.Advice.Add(advice);
        }

        public void DeleteAdvice(Advice advice)
        {
            _dataContext.Advice.Remove(advice);
        }

        public async Task<Advice?> GetAdviceAsync(Guid adviceId)
        {
            return await _dataContext.Advice.FirstOrDefaultAsync(x => x.Id == adviceId);
        }

        public async Task<List<Advice>> GetAllAdviceAsync()
        {
            return await _dataContext.Advice.ToListAsync();
        }
        
        public async Task<List<Advice>> SearchAdviceAsync(string searchTerm)
        {
            return await _dataContext.Advice.Where(a => a.Title.Contains(searchTerm)).ToListAsync();
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}