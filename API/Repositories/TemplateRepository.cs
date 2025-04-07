using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    public class TemplateRepository : ITemplateRepository
    {
        private readonly DataContext _dataContext;
        public TemplateRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public void CreateTemplate(Diet diet)
        {
            _dataContext.Diets.Add(diet);
        }

        public Task<Diet?> GetTemplateByIdAsync(Guid id)
        {
            return _dataContext.Diets
                .Include(d => d.DietDays)
                    .ThenInclude(dd => dd.DietMeals)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public Task<List<Diet>> GetAllTemplatesBriefAsync()
        {
            return _dataContext.Diets.Where(d => d.IsTemplate).ToListAsync();
        }

        public void DeleteTemplate(Diet diet)
        {
            _dataContext.Diets.Remove(diet);
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}