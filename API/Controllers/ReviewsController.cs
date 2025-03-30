using API.Models.Review;
using API.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class ReviewsController : BaseApiController
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }
        [HttpPost(Endpoints.Reviews.Create)] // POST http://localhost:5207/api/reviews
        public async Task<IActionResult> CreateReviewAsync(CreateReviewDto createReviewDto)
        {
            var userId = HttpContext.GetUserId();
            if (userId == null)
           {
                return Unauthorized();
            }
            var result = await _reviewService.CreateReviewAsync(createReviewDto, userId.Value);
            return MapToHttpResponse(result);
        }

        [HttpPut(Endpoints.Reviews.UpdateReview)] // PUT http://localhost:5207/api/reviews/{reviewId}
        public async Task<IActionResult> UpdateReviewAsync(UpdateReviewDto updateReviewDto)
        {
            var userId = HttpContext.GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }
            var result = await _reviewService.UpdateReviewAsync(updateReviewDto, userId.Value);
            return MapToHttpResponse(result);
        }

        [HttpDelete(Endpoints.Reviews.Delete)] // DELETE http://localhost:5207/api/reviews/{reviewId}
        public async Task<IActionResult> DeleteReviewAsync(Guid reviewId)
        {
            var userId = HttpContext.GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var result = await _reviewService.DeleteReviewAsync(reviewId, userId.Value);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Reviews.GetReview)] // GET http://localhost:5207/api/reviews/{reviewId}
        public async Task<IActionResult> GetReviewAsync(Guid reviewId)
        {
            var result = await _reviewService.GetReviewAsync(reviewId);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Reviews.Search)] // GET http://localhost:5207/api/reviews/search?userFullName={userFullName}
        public async Task<IActionResult> SearchReviewAsync([FromQuery] string userFullName)
        {
            var result = await _reviewService.SearchReviewAsync(userFullName);
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Reviews.GetAll)] // GET http://localhost:5207/api/reviews
        public async Task<IActionResult> GetAllReviewsAsync()
        {
            var result = await _reviewService.GetAllReviewsAsync();
            return MapToHttpResponse(result);
        }

        [HttpGet(Endpoints.Users.GetReviewByUserId)] // GET http://localhost:5207/api/users/{userId}/review
        public async Task<IActionResult> GetReviewsByUserId(Guid userId)
        {
            var result = await _reviewService.GetReviewByUserIdAsync(userId);
            return MapToHttpResponse(result);
        }

        [HttpGet("api/userId")] // GET http://localhost:5207/api/reviews/userId
        public IActionResult GetUserId()
        {
            var userId = HttpContext.GetUserId();
            if (userId == null)
            {
                return Unauthorized();
            }
            return Ok(userId.Value);
        }
    }
}