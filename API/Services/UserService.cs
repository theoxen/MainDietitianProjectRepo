using API.Common;
using API.Common.Enums;
using API.Data;
using API.Helpers;
using API.MobileMessaging.Interfaces;
using API.Models;
using API.Models.ForgetPassword;
using API.Models.Users;
using API.Repositories.IRepositories;
using API.Security;
using API.Services.IServices;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly IDietTypeRepository _dietTypeRepository;
    private readonly IUserRepository _userRepository;
    private readonly JwtService _jwtService;
    private readonly IOtpGenerator _otpGenerator;
    private readonly IOtpCache _otpCache;

    public UserService(UserManager<User> userManager, IDietTypeRepository dietTypeRepository, IUserRepository userRepository, JwtService jwtService, IOtpGenerator otpGenerator, IOtpCache otpCache)
    {
        _userManager = userManager;
        _dietTypeRepository = dietTypeRepository;
        _userRepository = userRepository;
        _jwtService = jwtService;
        _otpGenerator = otpGenerator;
        _otpCache = otpCache;
    }

    public async Task<Result<Empty>> RegisterClientAsync(RegisterClientDto registerClientDto)
    {
        if(!Enum.TryParse<Genders>(registerClientDto.Gender, out Genders gender)) // Tries to match the gender to any of our enums. Out creates a variable (outside of the if scope)
        {
            return Result<Empty>.BadRequest([new ResultError{
                Identifier = "Gender",
                Message = "Invalid gender"
            }]);
        }

        DietType? dietType = await _dietTypeRepository.GetDietTypeByIdAsync(registerClientDto.DietTypeId);
        if(dietType == null)
        {
            return Result<Empty>.NotFound();
        }

        bool phoneNumberExists = await _userRepository.DoesPhoneNumberExistAsync(registerClientDto.PhoneNumber);
        if(phoneNumberExists)
        {
            return Result<Empty>.BadRequest([new ResultError{
                Identifier = "PhoneNumber",
                Message = "Phone number already exists"
            }]);
        }

        registerClientDto.FullName = UserHelperFunctions.TrimFullName(registerClientDto.FullName);

        User user = new()
        {
            UserName = UserHelperFunctions.GenerateUniqueUserName(registerClientDto.FullName),
            FullName = registerClientDto.FullName,
            PhoneNumber = registerClientDto.PhoneNumber,
            Gender = gender.ToString().ToUpper(),
            DietTypeId = dietType.Id,
            DateOfBirth = registerClientDto.DateOfBirth,
            Height = registerClientDto.Height,
        };

        var userResult = await _userManager.CreateAsync(user, registerClientDto.Password);
        if(!userResult.Succeeded)
        {
            return Result<Empty>.BadRequest(userResult.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList()); // Iterating through the userResult errors and creating a new list of ResultError
        }

        var roleResult = await _userManager.AddToRoleAsync(user, "client");
        if(!roleResult.Succeeded)
        {
            return Result<Empty>.BadRequest(roleResult.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList());
        }

        return Result<Empty>.Ok(new Empty());
    }

    public async Task<Result<UserDto>> LoginUserAsync(LoginUserDto loginUserDto)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == loginUserDto.PhoneNumber); // FirstOrDefault instead of SingleOrDefault so it doesnt perform duplication checks
        if(user == null)
        {
            return Result<UserDto>.Unauthorized();
        }
        
        var result = await _userManager.CheckPasswordAsync(user, loginUserDto.Password);
        if(!result)
        {
            return Result<UserDto>.Unauthorized();
        }

        string[] roles = (await _userManager.GetRolesAsync(user)).ToArray();

        UserDto userDto = new()
        {
            FullName = user.FullName!,
            Roles = roles,
            Token = _jwtService.GenerateSecurityToken(user, roles)
        };
        return Result<UserDto>.Ok(userDto);
    }

    public async Task<Result<string>> SendOtpAsync(string phoneNumber)
    {
        bool doesPhoneNumberExist = await _userRepository.DoesPhoneNumberExistAsync(phoneNumber); 
        if(!doesPhoneNumberExist)
        {
            return Result<string>.NotFound();
        }

        string otp = _otpGenerator.GenerateOtp();

        var result = await _otpCache.StoreOtpAsync(otp, phoneNumber);
        if(!result.IsSuccessful)
        {
            return Result<string>.BadRequest(result.ResultErrors);
        }

        return Result<string>.Ok(otp);
    }


    public async Task<Result<Empty>> VerifyOtpAsync(string phoneNumber, string otp)
    {
        var otpRetrieved = await _otpCache.RetrieveOtpAsync(phoneNumber);
        if(otpRetrieved is null)
        {
            return Result<Empty>.NotFound();
        }

        if(!otpRetrieved.Equals(otp)) // Checking the otp retrieved from cache and the otp that we are provided with the user
        {
            return Result<Empty>.BadRequest([new ResultError{
                Identifier = "Otp",
                Message = "Invalid OTP"
            }]);
        }

        return Result<Empty>.Ok(new Empty());
    }

    public async Task<Result<UserDto>> ChangePasswordAsync(ChangePasswordDto changePasswordDto)
    {
        // Verify the otp
        var verificationResult = await VerifyOtpAsync(changePasswordDto.PhoneNumber, changePasswordDto.Otp);

        if(!verificationResult.IsSuccessful)
        {
            return Result<UserDto>.BadRequest(verificationResult.ResultErrors);
        }

        // Get the user by phone number
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == changePasswordDto.PhoneNumber);
        if(user == null)
        {
            return Result<UserDto>.NotFound();
        }

        // Generating dummy token to authorize the user to change the password because we already checked the OTP
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        // Reset user password
        var result = await _userManager.ResetPasswordAsync(user, token, changePasswordDto.NewPassword);

        if(!result.Succeeded)
        {
            return Result<UserDto>.BadRequest(result.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList());
        }

        // Get the user roles
        string[] roles = (await _userManager.GetRolesAsync(user)).ToArray();

        // Create a new UserDto
        UserDto userDto = new()
        {
            FullName = user.FullName!,
            Roles = roles,
            Token = _jwtService.GenerateSecurityToken(user, roles)
        };

        // Remove the otp from cache
        await _otpCache.RemoveOtpAsync(changePasswordDto.PhoneNumber);

        return Result<UserDto>.Ok(userDto);
    }
}
