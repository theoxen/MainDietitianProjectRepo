using API.Services.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Common;
using API.Data;
using API.Models.Review;
using API.Repositories.IRepositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Mvc;
using API.Extensions;

namespace API.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IUserService _userService; // Dependency on the user service

        public ReviewService(IReviewRepository reviewRepository, IUserService userService)
        {
            _reviewRepository = reviewRepository;
            _userService = userService; // Initialize the user service
        }

        public async Task<Result<ReviewDto>> CreateReviewAsync(CreateReviewDto createReviewDto, Guid userId)
        {
            // Check if the user has already created a review
            var existingReview = await _reviewRepository.GetReviewByUserIdAsync(userId);
            if (existingReview != null)
            {
                return Result<ReviewDto>.BadRequest(new List<ResultError>
                {
                    new ResultError
                    {
                        Identifier = "ReviewAlreadyExists",
                        Message = "User has already submitted a review"
                    }
                });
            }

            if (createReviewDto.Stars < 1 || createReviewDto.Stars > 5)
            {
                return Result<ReviewDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "ReviewStarsOutOfRange",
                    Message = "Review stars must be between 1 and 5"
                }
            });
            }

            // Determine the user's full name based on the IsAnonymous flag
            string userFullName;
            if (createReviewDto.IsAnonymous)
            {
                userFullName = "Anonymous";
            }
            else
            {
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return Result<ReviewDto>.NotFound();
                }
                userFullName = user.Data!.FullName;
            }

            // Create a new Review object from the DTO
            var review = new Review
            {
                Id = Guid.NewGuid(),
                ReviewText = createReviewDto.ReviewText,
                Stars = createReviewDto.Stars,
                DateCreated = DateTime.UtcNow,
                UserFullName = userFullName,
                UserId = userId,
                IsAnonymous = createReviewDto.IsAnonymous
            };

            // Add the new review to the repository
            _reviewRepository.CreateReview(review);

            // Commit the changes to the repository
            if (await _reviewRepository.Commit())
            {
                // Return a successful result with the created review details
                return Result<ReviewDto>.Ok(new ReviewDto
                {
                    Id = review.Id,
                    ReviewText = review.ReviewText,
                    Stars = review.Stars,
                    DateCreated = review.DateCreated,
                    UserFullName = review.UserFullName,
                    UserId = review.UserId
                });
            }

            return Result<ReviewDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedCreatingReview",
                    Message = "Failed to Create review"
                }
            });
        }

        public async Task<Result<ReviewDto>> UpdateReviewAsync(UpdateReviewDto updateReviewDto, Guid userId)
        {
            var review = await _reviewRepository.GetReviewAsync(updateReviewDto.Id);
            if (review == null)
            {
                return Result<ReviewDto>.NotFound();
            }

            // Check if the user is authorized to delete the review
            if (review.UserId != userId)
            {
                return Result<ReviewDto>.Unauthorized();
            }

            if (updateReviewDto.Stars < 1 || updateReviewDto.Stars > 5)
            {
                return Result<ReviewDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "ReviewStarsOutOfRange",
                    Message = "Review stars must be between 1 and 5"
                }
            });
            }
            // Determine the user's full name based on the IsAnonymous flag
            string userFullName;
            if (updateReviewDto.IsAnonymous)
            {
                userFullName = "Anonymous";
            }
            else
            {
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return Result<ReviewDto>.NotFound();
                }
                userFullName = user.Data!.FullName;
            }

            // Update the review with the new details
            review.ReviewText = updateReviewDto.ReviewText;
            review.Stars = updateReviewDto.Stars;
            review.UserFullName = userFullName;
            review.IsAnonymous = updateReviewDto.IsAnonymous;

            _reviewRepository.UpdateReview(review);

            // Commit the changes to the repository
            if (await _reviewRepository.Commit())
            {
                // Return a successful result with the updated review details
                return Result<ReviewDto>.Ok(new ReviewDto
                {
                    Id = review.Id,
                    ReviewText = review.ReviewText,
                    Stars = review.Stars,
                    DateCreated = review.DateCreated,
                    UserFullName = review.UserFullName,
                    UserId = review.UserId
                });
            }

            return Result<ReviewDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedUpdatingReview",
                    Message = "Failed to update review"
                }
            });
        }

        public async Task<Result<Empty>> DeleteReviewAsync(Guid reviewId, Guid userId)
        {
            // Retrieve the review entry from the repository
            var review = await _reviewRepository.GetReviewAsync(reviewId);
            if (review == null)
            {
                return Result<Empty>.NotFound();
            }

            // Check if the user is authorized to delete the review
            if (review.UserId != userId)
            {
                return Result<Empty>.Unauthorized();
            }

            // Delete the review
            _reviewRepository.DeleteReview(review);

            // Commit the changes to the repository
            if (await _reviewRepository.Commit())
            {
                return Result<Empty>.Ok(new Empty());
            }

            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "FailedDeletingReview",
                    Message = "Failed to delete review"
                }
            });
        }

        public async Task<Result<ReviewDto>> GetReviewAsync(Guid userId)
        {
            var review = await _reviewRepository.GetReviewAsync(userId);
            if (review == null)
            {
                return Result<ReviewDto>.NotFound();
            }

            var reviewDto = new ReviewDto
            {
                Id = review.Id,
                ReviewText = review.ReviewText,
                Stars = review.Stars,
                DateCreated = review.DateCreated,
                UserFullName = review.IsAnonymous ? "Anonymous" : review.UserFullName ?? "Anonymous",
                UserId = review.UserId
            };

            return Result<ReviewDto>.Ok(reviewDto);
        }

        public async Task<Result<List<ReviewDto>>> GetAllReviewsAsync()
        {
            // Retrieve all review entries from the repository
            var reviews = await _reviewRepository.GetAllReviewsAsync();
            
            // Map the review entries to DTOs
            var reviewDtoList = reviews.Select(review => new ReviewDto
            {
                Id = review.Id,
                ReviewText = review.ReviewText,
                Stars = review.Stars,
                DateCreated = review.DateCreated,
                UserFullName = review.IsAnonymous ? "Anonymous" : review.UserFullName ?? "Anonymous",
                UserId = review.UserId
            }).ToList();
            
            // Return a successful result with the list of review DTOs
            return Result<List<ReviewDto>>.Ok(reviewDtoList);
        }

        public async Task<Result<List<ReviewDto>>> SearchReviewAsync(string userFullName)
        {
            // Retrieve all review entries matching the userFullName from the repository
            var reviews = await _reviewRepository.SearchReviewAsync(userFullName);
            
            // Map the review entries to DTOs
            var reviewDtoList = reviews.Select(review => new ReviewDto
            {
                Id = review.Id,
                ReviewText = review.ReviewText,
                Stars = review.Stars,
                DateCreated = review.DateCreated,
                UserFullName = review.IsAnonymous ? "Anonymous" : review.UserFullName ?? "Anonymous",
                UserId = review.UserId
            }).ToList();
            
            // Return a successful result with the list of review DTOs
            return Result<List<ReviewDto>>.Ok(reviewDtoList);
        }

        public async Task<Result<ReviewDto>> GetReviewByUserIdAsync(Guid userId)
        {
            // Retrieve the review entry from the repository
            var review = await _reviewRepository.GetReviewByUserIdAsync(userId);
            if (review == null)
            {
                return Result<ReviewDto>.NotFound();
            }

            // Map the review entry to a DTO
            var reviewDto = new ReviewDto
            {
                Id = review.Id,
                ReviewText = review.ReviewText,
                Stars = review.Stars,
                DateCreated = review.DateCreated,
                UserFullName = review.IsAnonymous ? "Anonymous" : review.UserFullName ?? "Anonymous",
                UserId = review.UserId
            };

            // Return a successful result with the review DTO
            return Result<ReviewDto>.Ok(reviewDto);
        }
    }
}