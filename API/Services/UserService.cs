using System.Text.RegularExpressions;
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
    private readonly IMessagingService _messagingService;

    public UserService(UserManager<User> userManager, IDietTypeRepository dietTypeRepository, IUserRepository userRepository, JwtService jwtService, IOtpGenerator otpGenerator, IOtpCache otpCache, IMessagingService messagingService)
    {
        _userManager = userManager;
        _dietTypeRepository = dietTypeRepository;
        _userRepository = userRepository;
        _jwtService = jwtService;
        _otpGenerator = otpGenerator;
        _otpCache = otpCache;
        _messagingService = messagingService;
    }

    public async Task<Result<Empty>> RegisterClientAsync(RegisterClientDto registerClientDto)
    {
        List<ResultError> validationErrors = new();

        if (!Regex.IsMatch(registerClientDto.Height.ToString(), @"^\d{1,3}$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Height",
                Message = "Invalid height (must be 2 or 3 digits)"
            });
        }

        if (!Regex.IsMatch(registerClientDto.PhoneNumber, @"^\d+$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "PhoneNumber",
                Message = "Invalid phone number"
            });
        }

        // Validate email with regex: ^[^@\s]+@[^@\s]+\.[^@\s]+$
        if (!Regex.IsMatch(registerClientDto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Email",
                Message = "Invalid email"
            });
        }

        if (!Regex.IsMatch(registerClientDto.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Password",
                Message = "Password must be at least 6 characters, contain an uppercase, a lowercase, a number, and a special character"
            });
        }

        if (!Enum.TryParse<Genders>(registerClientDto.Gender, out Genders gender)) // Tries to match the gender to any of our enums. Out creates a variable (outside of the if scope)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Gender",
                Message = "Invalid gender"
            });
        }

        bool phoneNumberExists = await _userRepository.DoesPhoneNumberExistAsync(registerClientDto.PhoneNumber);
        if (phoneNumberExists)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "PhoneNumber",
                Message = "Phone number already exists"
            });
        }

        var userExistsFromEmail = await _userManager.FindByEmailAsync(registerClientDto.Email);
        if (userExistsFromEmail != null)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Email",
                Message = "Email already exists"
            });
        }

        if (validationErrors.Count > 0)
        {
            return Result<Empty>.BadRequest(validationErrors);
        }

        DietType? dietType = await _dietTypeRepository.GetDietTypeByIdAsync(registerClientDto.DietTypeId);
        if (dietType == null)
        {
            return Result<Empty>.NotFound();
        }

        registerClientDto.FullName = UserHelperFunctions.TrimFullName(registerClientDto.FullName);

        User user = new()
        {
            UserName = UserHelperFunctions.GenerateUniqueUserName(registerClientDto.FullName),
            Email = registerClientDto.Email,
            FullName = registerClientDto.FullName,
            PhoneNumber = registerClientDto.PhoneNumber,
            Gender = gender.ToString().ToUpper(),
            DietTypeId = dietType.Id,
            DateOfBirth = registerClientDto.DateOfBirth,
            Height = registerClientDto.Height,
        };

        var userResult = await _userManager.CreateAsync(user, registerClientDto.Password);
        if (!userResult.Succeeded)
        {
            return Result<Empty>.BadRequest(userResult.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList()); // Iterating through the userResult errors and creating a new list of ResultError
        }

        var roleResult = await _userManager.AddToRoleAsync(user, "client");
        if (!roleResult.Succeeded)
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
        if (!Regex.IsMatch(loginUserDto.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$"))
        {
            return Result<UserDto>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "Password",
                    Message = "Password must be at least 6 characters, contain an uppercase, a lowercase, a number, and a special character"
                }
            });
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == loginUserDto.PhoneNumber); // FirstOrDefault instead of SingleOrDefault so it doesnt perform duplication checks
        if (user == null)
        {
            return Result<UserDto>.Unauthorized();
        }

        var result = await _userManager.CheckPasswordAsync(user, loginUserDto.Password);
        if (!result)
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

    public async Task<Result<Empty>> SendOtpAsync(string email)
    {
        List<ResultError> validationErrors = new();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "EmailNotFound",
                Message = "Email not found"
            });
            return Result<Empty>.BadRequest(validationErrors);
        }

        string otp = _otpGenerator.GenerateOtp();

        var result = await _otpCache.StoreOtpAsync(otp, email);
        if (!result.IsSuccessful)
        {
            return Result<Empty>.BadRequest(result.ResultErrors);
        }

        // Send the otp to the user via email
        var emailResult = await _messagingService.SendEmail(email, "Password Reset OTP", $"Your OTP is: {otp}. Expires in 5 minutes.");

        if (!emailResult)
        {
            return Result<Empty>.InternalServerError();
        }

        return Result<Empty>.Ok(new Empty());
    }


    public async Task<Result<Empty>> VerifyOtpAsync(string email, string otp)
    {
        List<ResultError> validationErrors = new();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "EmailNotFound",
                Message = "Email not found"
            });
            return Result<Empty>.BadRequest(validationErrors);
        }


        var otpRetrieved = await _otpCache.RetrieveOtpAsync(email);
        if (otpRetrieved is null)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "OtpNotRequested",
                Message = "User has not requested an OTP or has expired"
            });
            return Result<Empty>.BadRequest(validationErrors);
        }

        if (!otpRetrieved.Equals(otp)) // Checking the otp retrieved from cache and the otp that we are provided with the user
        {
            return Result<Empty>.BadRequest([new ResultError{
                Identifier = "OtpInvalid",
                Message = "Invalid OTP"
            }]);
        }

        return Result<Empty>.Ok(new Empty());
    }

    public async Task<Result<Empty>> ChangePasswordAsync(ChangePasswordDto changePasswordDto)
    {
        if (!Regex.IsMatch(changePasswordDto.NewPassword, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$"))
        {
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "Password",
                    Message = "Password must be at least 6 characters, contain an uppercase, a lowercase, a number, and a special character"
                }
            });
        }
        // Verify the otp
        var verificationResult = await VerifyOtpAsync(changePasswordDto.Email, changePasswordDto.Otp);

        if (!verificationResult.IsSuccessful)
        {
            return Result<Empty>.BadRequest(verificationResult.ResultErrors);
        }

        // Get the user by email
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == changePasswordDto.Email);
        if (user == null)
        {
            return Result<Empty>.NotFound();
        }

        // Generating dummy token to authorize the user to change the password because we already checked the OTP
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        // Reset user password
        var result = await _userManager.ResetPasswordAsync(user, token, changePasswordDto.NewPassword);

        if (!result.Succeeded)
        {
            return Result<Empty>.BadRequest(result.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList());
        }

        // THE FOLLOWING COMMENTED OUT PART IS FOR DIRECTLY LOGGING IN THE USER AFTER CHANGING THE PASSWORD INSTEAD OF TRANSFERING THEM TO THE LOGIN PAGE.
        // Get the user roles
        // string[] roles = (await _userManager.GetRolesAsync(user)).ToArray();

        // // Create a new UserDto
        // UserDto userDto = new()
        // {
        //     FullName = user.FullName!,
        //     Roles = roles,
        //     Token = _jwtService.GenerateSecurityToken(user, roles)
        // };

        // Remove the otp from cache
        await _otpCache.RemoveOtpAsync(changePasswordDto.Email);

        return Result<Empty>.Ok(new Empty());
    }

    public async Task<Result<UserProfileDto>> ViewClientProfileAsync(string phoneNumber)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
        if (user == null)
        {
            return Result<UserProfileDto>.NotFound();
        }


        string dietTypeName = "Unknown";
        if (user.DietTypeId.HasValue)
        {
            var dietType = await _dietTypeRepository.GetDietTypeByIdAsync(user.DietTypeId.Value);
            if (dietType != null)
            {
                dietTypeName = dietType.Name; // Assuming DietType has a Name property
            }
        }

        UserProfileDto userProfileDto = new()
        {
            FullName = user.FullName!,
            PhoneNumber = user.PhoneNumber!,
            Email = user.Email!,
            Height = user.Height!,
            DietTypeName = dietTypeName,
            Gender = user.Gender,
            DateOfBirth = user.DateOfBirth
        };
        return Result<UserProfileDto>.Ok(userProfileDto);
    }

    public async Task<Result<UserProfileDto>> GetUserByIdAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Result<UserProfileDto>.NotFound();
        }

        string dietTypeName = "Unknown";
        if (user.DietTypeId.HasValue)
        {
            var dietType = await _dietTypeRepository.GetDietTypeByIdAsync(user.DietTypeId.Value);
            if (dietType != null)
            {
                dietTypeName = dietType.Name; // Assuming DietType has a Name property
            }
        }

        UserProfileDto userProfileDto = new()
        {
            FullName = user.FullName!,
            PhoneNumber = user.PhoneNumber!,
            Email = user.Email!,
            Height = user.Height!,
            DietTypeName = dietTypeName,
            Gender = user.Gender,
            DateOfBirth = user.DateOfBirth    
        };
        return Result<UserProfileDto>.Ok(userProfileDto);
    }
    
    public async Task<Result<Empty>> DeleteUserAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return Result<Empty>.NotFound();
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return Result<Empty>.BadRequest(result.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList());
        }

        return Result<Empty>.Ok(new Empty());
    }

    public async Task<Result<Empty>> UpdateUserProfileAsync(UserProfileUpdateDto userProfileUpdateDto)
    {
        if (!Regex.IsMatch(userProfileUpdateDto.Height.ToString(), @"^\d{1,3}$"))
        {
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError{
                    Identifier = "Height",
                    Message = "Invalid height (must be 2 or 3 digits)"
                }
            });
        }

        if (!Regex.IsMatch(userProfileUpdateDto.PhoneNumber, @"^\d+$"))
        {
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "PhoneNumber",
                    Message = "Invalid phone number"
                }
            });
        }

        if (!Regex.IsMatch(userProfileUpdateDto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "Email",
                    Message = "Invalid email"
                }
                });
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userProfileUpdateDto.UserId);
        if (user == null)
        {
            return Result<Empty>.NotFound();
        }

        DietType? dietType = await _dietTypeRepository.GetDietTypeByIdAsync(userProfileUpdateDto.DietTypeId);
        if (dietType == null)
        {
            return Result<Empty>.NotFound();
        }

        // Check if phone number already exists
        bool phoneNumberExists = await _userRepository.DoesPhoneNumberExistAsync(userProfileUpdateDto.PhoneNumber);
        if (phoneNumberExists && user.PhoneNumber != userProfileUpdateDto.PhoneNumber)
        {
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "PhoneNumber",
                    Message = "Phone number already exists"
                }
            });
        }

        // Check if email already exists
        var userExistsFromEmail = await _userManager.FindByEmailAsync(userProfileUpdateDto.Email);
        if (userExistsFromEmail != null && userExistsFromEmail.Id != userProfileUpdateDto.UserId)
        {
            return Result<Empty>.BadRequest(new List<ResultError>
            {
                new ResultError
                {
                    Identifier = "Email",
                    Message = "Email already exists"
                }
            });
        }

        // NO NEED TO CHECK FOR EQUAL CONTENT OF THE FIELDS BECAUSE USERMANAGER DOES NOT RETURN AN ERROR IF THE NEW VALUE IS THE SAME AS THE OLD VALUE

        // Update user properties
        user.FullName = userProfileUpdateDto.FullName;
        user.PhoneNumber = userProfileUpdateDto.PhoneNumber;
        user.Email = userProfileUpdateDto.Email;
        user.Height = userProfileUpdateDto.Height;
        user.DietTypeId = userProfileUpdateDto.DietTypeId;
        user.UserName = UserHelperFunctions.GenerateUniqueUserName(user.FullName);

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Result<Empty>.BadRequest(result.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList());
        }
        
        return Result<Empty>.Ok(new Empty());
    }
}
