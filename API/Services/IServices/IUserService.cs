using API.Common;
using API.Models;
using API.Models.ForgetPassword;
using API.Models.Users;

namespace API.Services.IServices;

public interface IUserService
{
    public Task<Result<Empty>> RegisterClientAsync(RegisterClientDto registerClientDto);
    public Task<Result<UserDto>> LoginUserAsync(LoginUserDto loginUserDto);
    public Task<Result<string>> SendOtpAsync(string phoneNumber);
    public Task<Result<Empty>> VerifyOtpAsync(string phoneNumber, string otp);
    public Task<Result<UserDto>> ChangePasswordAsync(ChangePasswordDto changePasswordDto);
}
