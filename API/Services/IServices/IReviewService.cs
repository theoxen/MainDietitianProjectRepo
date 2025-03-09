using API.Common;
using API.Data;
using API.Models.Review;
namespace API.Services.IServices
{
    public interface IReviewService
    {
        Task<Result<ReviewDto>> CreateReviewAsync(CreateReviewDto createReviewDto, Guid userId);
        Task<Result<ReviewDto>> UpdateReviewAsync(UpdateReviewDto updateReviewDto, Guid userId);
        Task<Result<Empty>> DeleteReviewAsync(Guid reviewId, Guid userId);
        Task<Result<ReviewDto>> GetReviewAsync(Guid reviewId);
        Task<Result<List<ReviewDto>>> SearchReviewAsync(string userFullName);
        Task<Result<List<ReviewDto>>> GetAllReviewsAsync();
        Task<Result<ReviewDto>> GetReviewByUserIdAsync(Guid userId);
    }
}