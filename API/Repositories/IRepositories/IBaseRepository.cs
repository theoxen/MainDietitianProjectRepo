namespace API.Repositories.IRepositories
{
    public interface IBaseRepository
    {
        Task<bool> Commit();
    }
}