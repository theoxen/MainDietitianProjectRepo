using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly DataContext _dataContext;

        public ReviewRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public void CreateReview(Review review)
        {
            _dataContext.Reviews.Add(review);
        }

        public void UpdateReview(Review review)
        {
            _dataContext.Reviews.Update(review);
        }

        public void DeleteReview(Review review)
        {
            _dataContext.Reviews.Remove(review);
        }

        public async Task<Review?> GetReviewAsync(Guid reviewId)
        {
            return await _dataContext.Reviews.FindAsync(reviewId);
        }

        public async Task<List<Review>> SearchReviewAsync(string userFullName)
        {
            return await _dataContext.Reviews
                .Where(r => r.UserFullName != null && r.UserFullName.Contains(userFullName))
                .ToListAsync();
        }

        public async Task<List<Review>> GetAllReviewsAsync()
        {
            return await _dataContext.Reviews.ToListAsync();
        }

        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}