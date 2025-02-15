using API.Models;
using API.Models.ForgetPassword;
using API.Models.Users;
using API.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }


        // TODO: REMOVE THE COMMENTS FROM THIS[Authorize(Roles = "admin")]
        [HttpPost(Endpoints.Users.RegisterUser)]
        public async Task<IActionResult> RegisterUserAsync(RegisterClientDto registerClientDto)
        {
            var result = await _userService.RegisterClientAsync(registerClientDto);
            return MapToHttpResponse(result);
        }

        [HttpPost(Endpoints.Users.LoginUser)]
        public async Task<IActionResult> LoginUserAsync(LoginUserDto loginUserDto)
        {
            var result = await _userService.LoginUserAsync(loginUserDto);
            return MapToHttpResponse(result);
        }

        [HttpPost(Endpoints.Users.SendOtp)]
        public async Task<IActionResult> SendOtp(SendOtpDto sendOtpDto)
        {
            var result = await _userService.SendOtpAsync(sendOtpDto.Email);
            return MapToHttpResponse(result);
        }

        
        [HttpPost(Endpoints.Users.VerifyOtp)]
        public async Task<IActionResult> VerifyOtp(OtpVerificationDto otpVerificationDto)
        {
            var result = await _userService.VerifyOtpAsync(otpVerificationDto.Email, otpVerificationDto.Otp);
            return MapToHttpResponse(result);
        }

        [HttpPost(Endpoints.Users.ChangePassword)]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var response = await _userService.ChangePasswordAsync(changePasswordDto);
            return MapToHttpResponse(response);
        }
    }
}
