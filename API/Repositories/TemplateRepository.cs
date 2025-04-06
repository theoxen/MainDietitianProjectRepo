using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Repositories.IRepositories;

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

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}