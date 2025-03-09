using API.Data;

namespace API.Repositories.IRepositories
{
    public interface IReviewRepository : IBaseRepository
    {
        void CreateReview(Review review);
        void UpdateReview(Review review);
        void DeleteReview(Review review);
        Task<Review?> GetReviewAsync(Guid reviewId);
        Task<List<Review>> SearchReviewAsync(string userFullName);
        Task<List<Review>> GetAllReviewsAsync();
        Task<Review?> GetReviewByUserIdAsync(Guid userId);
        new Task<bool> Commit();
    }
}