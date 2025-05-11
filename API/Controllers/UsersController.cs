using API.Models;
using API.Models.ForgetPassword;
using API.Models.Users;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    // Controller for handling all user-related API endpoints
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        // Inject the user service for business logic
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // Register a new client (admin only)
        [Authorize(Roles = "admin")]
        [HttpPost(Endpoints.Users.RegisterUser)]
        public async Task<IActionResult> RegisterUserAsync(RegisterClientDto registerClientDto)
        {
            var result = await _userService.RegisterClientAsync(registerClientDto);
            return MapToHttpResponse(result);
        }

        // Login endpoint (open to all)
        [AllowAnonymous]
        [HttpPost(Endpoints.Users.LoginUser)]
        public async Task<IActionResult> LoginUserAsync(LoginUserDto loginUserDto)
        {
            var result = await _userService.LoginUserAsync(loginUserDto);
            return MapToHttpResponse(result);
        }

        // Send OTP for password reset (open to all)
        [AllowAnonymous]
        [HttpPost(Endpoints.Users.SendOtp)]
        public async Task<IActionResult> SendOtp(SendOtpDto sendOtpDto)
        {
            var result = await _userService.SendOtpAsync(sendOtpDto.Email);
            return MapToHttpResponse(result);
        }

        // Verify OTP for password reset (open to all)
        [AllowAnonymous]
        [HttpPost(Endpoints.Users.VerifyOtp)]
        public async Task<IActionResult> VerifyOtp(OtpVerificationDto otpVerificationDto)
        {
            var result = await _userService.VerifyOtpAsync(otpVerificationDto.Email, otpVerificationDto.Otp);
            return MapToHttpResponse(result);
        }

        // Change password (open to all)
        [AllowAnonymous]
        [HttpPost(Endpoints.Users.ChangePassword)]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var response = await _userService.ChangePasswordAsync(changePasswordDto);
            return MapToHttpResponse(response);
        }

        // View a client's profile by ID (admin only)
        [Authorize(Roles = "admin")]
        [HttpGet(Endpoints.Users.ViewProfile)]
        public async Task<IActionResult> ViewProfile(Guid id)
        {
            var response = await _userService.ViewClientProfileAsync(id);
            return MapToHttpResponse(response);
        }

        // Delete a user by ID (admin only)
        [Authorize(Roles = "admin")]
        [HttpDelete(Endpoints.Users.DeleteUser)]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var response = await _userService.DeleteUserAsync(id);
            return MapToHttpResponse(response);
        }

        // Update a user's profile (admin only)
        [Authorize(Roles = "admin")]
        [HttpPut(Endpoints.Users.UpdateProfile)]
        public async Task<IActionResult> UpdateProfile(UserProfileUpdateDto userProfileUpdateDto)
        {
            var response = await _userService.UpdateUserProfileAsync(userProfileUpdateDto);
            return MapToHttpResponse(response);
        }

        // Get user ID by phone number (admin only)
        [Authorize(Roles = "admin")]
        [HttpGet(Endpoints.Users.GetUserIdByPhoneNumber)]
        public async Task<IActionResult> GetUserIdByPhoneNumber(string phoneNumber)
        {
            var response = await _userService.GetUserIdByPhoneNumberAsync(phoneNumber);
            return MapToHttpResponse(response);
        }

        // Get all clients (admin only)
        [Authorize(Roles = "admin")]
        [HttpGet(Endpoints.Users.GetAllClients)]
        public async Task<IActionResult> GetAllClients()
        {
            var result = await _userService.GetAllClientsAsync();
            return MapToHttpResponse(result);
        }

        // Get all clients with their IDs (open to all)
        [HttpGet(Endpoints.Users.GetAllClientsWithId)]
        public async Task<IActionResult> GetAllClientsWithId()
        {
            var result = await _userService.GetAllClientsWithIdAsync();
            return MapToHttpResponse(result);
        }
    }
}