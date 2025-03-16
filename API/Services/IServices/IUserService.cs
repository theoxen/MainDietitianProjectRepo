using API.Common;
using API.Data;
using API.Models;
using API.Models.ForgetPassword;
using API.Models.Users;

namespace API.Services.IServices;

public interface IUserService
{
    public Task<Result<Empty>> RegisterClientAsync(RegisterClientDto registerClientDto);
    public Task<Result<UserDto>> LoginUserAsync(LoginUserDto loginUserDto);
    public Task<Result<Empty>> SendOtpAsync(string email);
    public Task<Result<Empty>> VerifyOtpAsync(string email, string otp);
    public Task<Result<Empty>> ChangePasswordAsync(ChangePasswordDto changePasswordDto);
    public Task<Result<UserProfileDto>> ViewClientProfileAsync(Guid id);
    public Task<Result<Empty>> DeleteUserAsync(Guid id);
    public Task<Result<Empty>> UpdateUserProfileAsync(UserProfileUpdateDto userProfileUpdateDto);
    public Task<Result<Guid>> GetUserIdByPhoneNumberAsync(string phoneNumber);
    public Task<Result<UserProfileDto>> GetUserByIdAsync(Guid userId);
    public Task<Result<IEnumerable<UserProfileDto>>> GetAllClientsAsync();
}
