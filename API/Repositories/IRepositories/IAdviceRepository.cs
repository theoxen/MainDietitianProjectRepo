using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Common;
using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IAdviceRepository : IBaseRepository
    {
        public void CreateAdvice(Advice advice);// Method to create a new Advice record
        public void DeleteAdvice(Advice advice);
        Task<Advice?> GetAdviceAsync(Guid adviceId);// Asynchronous method to retrieve a specific Advice by its unique ID
        Task<List<Advice>> GetAllAdviceAsync();
        Task<List<Advice>> SearchAdviceAsync(string searchTerm);
    }
}