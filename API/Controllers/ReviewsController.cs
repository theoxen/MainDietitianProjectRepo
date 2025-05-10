using API.Models.Review; // Importing the namespace for review-related models (e.g., DTOs)
using API.Services.IServices; // Importing the interface for review services
using Microsoft.AspNetCore.Mvc; // Importing ASP.NET Core MVC functionalities
using System; // Importing system-level functionalities
using System.Threading.Tasks; // Importing support for asynchronous programming
using API.Extensions; // Importing custom extensions (e.g., for HttpContext)
using API.Services; // Importing services used in the application
using Microsoft.AspNetCore.Authorization; // Importing authorization functionalities

namespace API.Controllers
{
    // Controller for handling review-related API endpoints
    public class ReviewsController : BaseApiController
    {
        private readonly IReviewService _reviewService;// Dependency injection for the review service

        // Constructor to initialize the review service
        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // Endpoint to create a new review
        // Accessible only to users with the "client" role
        [Authorize(Roles = "client")] 
        [HttpPost(Endpoints.Reviews.Create)] // POST to creat review
        public async Task<IActionResult> CreateReviewAsync(CreateReviewDto createReviewDto)
        {
            // Retrieve the user ID from the HTTP context
            var userId = HttpContext.GetUserId();
            if (userId == null)
           {
                // If the user ID is not found, return an Unauthorized response
                return Unauthorized();
            }
            // Call the service to create a review, passing the DTO and user ID
            var result = await _reviewService.CreateReviewAsync(createReviewDto, userId.Value);
            // Map the result to an appropriate HTTP response
            return MapToHttpResponse(result);
        }

        [Authorize(Roles = "client")]
        [HttpPut(Endpoints.Reviews.UpdateReview)] // PUT request to update a review by ID
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

        [Authorize(Roles = "client")]
        [HttpDelete(Endpoints.Reviews.Delete)] // DELETE by id
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

         // Endpoint to retrieve a specific review by its ID
        [HttpGet(Endpoints.Reviews.GetReview)] // GET http://localhost:5207/api/reviews/{reviewId}
        public async Task<IActionResult> GetReviewAsync(Guid reviewId)
        {
            var result = await _reviewService.GetReviewAsync(reviewId);
            return MapToHttpResponse(result);
        }

        // Endpoint to search for reviews by the user's full name
        [HttpGet(Endpoints.Reviews.Search)] // GET http://localhost:5207/api/reviews/search?userFullName={userFullName}
        public async Task<IActionResult> SearchReviewAsync([FromQuery] string userFullName)
        {
            var result = await _reviewService.SearchReviewAsync(userFullName);
            return MapToHttpResponse(result);
        }

        // Endpoint to retrieve all reviews
        [HttpGet(Endpoints.Reviews.GetAll)] 
        public async Task<IActionResult> GetAllReviewsAsync()
        {
            var result = await _reviewService.GetAllReviewsAsync();
            return MapToHttpResponse(result);
        }

        // Endpoint to retrieve reviews by a specific user's ID
        [HttpGet(Endpoints.Users.GetReviewByUserId)] 
        public async Task<IActionResult> GetReviewsByUserId(Guid userId)
        {
            // Call the service to fetch reviews associated with the given user ID
            var result = await _reviewService.GetReviewByUserIdAsync(userId);
            return MapToHttpResponse(result);
        }

        
        // Endpoint to retrieve the current user's ID from the HTTP context
        [HttpGet("api/userId")] 
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