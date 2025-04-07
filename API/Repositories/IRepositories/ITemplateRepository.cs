using API.Data;

namespace API.Repositories.IRepositories
{
    public interface ITemplateRepository : IBaseRepository
    {
        public void CreateTemplate(Diet diet);
        public Task<Diet?> GetTemplateByIdAsync(Guid id);
        public Task<List<Diet>> GetAllTemplatesBriefAsync();
        public void DeleteTemplate(Diet diet);
    }
}