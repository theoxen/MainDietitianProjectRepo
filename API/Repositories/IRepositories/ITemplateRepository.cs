using API.Data;

namespace API.Repositories.IRepositories
{
    public interface ITemplateRepository : IBaseRepository
    {
        public void CreateTemplate(Diet diet);
    }
}