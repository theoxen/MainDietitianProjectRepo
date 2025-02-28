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
    public void CreateAdvice(Advice advice);
    public void DeleteAdvice(Advice advice);
    Task<Advice?> GetAdviceAsync(Guid adviceId);
    Task<IEnumerable<Advice>> GetAllAdviceAsync();
    }
}