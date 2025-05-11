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

/// <summary>
/// Service for handling all user-related business logic and data access.
/// </summary>
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

    public UserService(
        UserManager<User> userManager,
        IDietTypeRepository dietTypeRepository,
        IUserRepository userRepository,
        JwtService jwtService,
        IOtpGenerator otpGenerator,
        IOtpCache otpCache,
        IMessagingService messagingService)
    {
        _userManager = userManager;
        _dietTypeRepository = dietTypeRepository;
        _userRepository = userRepository;
        _jwtService = jwtService;
        _otpGenerator = otpGenerator;
        _otpCache = otpCache;
        _messagingService = messagingService;
    }

    /// <summary>
    /// Registers a new client after validating all fields.
    /// </summary>
    public async Task<Result<Empty>> RegisterClientAsync(RegisterClientDto registerClientDto)
    {
        List<ResultError> validationErrors = new();

        // Validate height (must be 2 or 3 digits)
        if (!Regex.IsMatch(registerClientDto.Height.ToString(), @"^\d{1,3}$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Height",
                Message = "Invalid height (must be 2 or 3 digits)"
            });
        }

        // Validate phone number (digits only)
        if (!Regex.IsMatch(registerClientDto.PhoneNumber, @"^\d+$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "PhoneNumber",
                Message = "Invalid phone number"
            });
        }

        // Validate email format
        if (!Regex.IsMatch(registerClientDto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Email",
                Message = "Invalid email"
            });
        }

        // Validate password complexity
        if (!Regex.IsMatch(registerClientDto.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$"))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Password",
                Message = "Password must be at least 6 characters, contain an uppercase, a lowercase, a number, and a special character"
            });
        }

        // Validate gender (must match enum)
        if (!Enum.TryParse<Genders>(registerClientDto.Gender, out Genders gender))
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Gender",
                Message = "Invalid gender"
            });
        }

        // Check for duplicate phone number
        bool phoneNumberExists = await _userRepository.DoesPhoneNumberExistAsync(registerClientDto.PhoneNumber);
        if (phoneNumberExists)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "PhoneNumber",
                Message = "Phone number already exists"
            });
        }

        // Check for duplicate email
        var userExistsFromEmail = await _userManager.FindByEmailAsync(registerClientDto.Email);
        if (userExistsFromEmail != null)
        {
            validationErrors.Add(new ResultError
            {
                Identifier = "Email",
                Message = "Email already exists"
            });
        }

        // If any validation errors, return them
        if (validationErrors.Count > 0)
        {
            return Result<Empty>.BadRequest(validationErrors);
        }

        // Check if diet type exists
        DietType? dietType = await _dietTypeRepository.GetDietTypeByIdAsync(registerClientDto.DietTypeId);
        if (dietType == null)
        {
            return Result<Empty>.NotFound();
        }

        // Trim and prepare user data
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

        // Create user in database
        var userResult = await _userManager.CreateAsync(user, registerClientDto.Password);
        if (!userResult.Succeeded)
        {
            return Result<Empty>.BadRequest(userResult.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList());
        }

        // Assign "client" role to user
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

    /// <summary>
    /// Handles user login and returns a JWT token if successful.
    /// </summary>
    public async Task<Result<UserDto>> LoginUserAsync(LoginUserDto loginUserDto)
    {
        // Validate password complexity
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

        // Find user by phone number
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == loginUserDto.PhoneNumber);
        if (user == null)
        {
            return Result<UserDto>.Unauthorized();
        }

        // Check password
        var result = await _userManager.CheckPasswordAsync(user, loginUserDto.Password);
        if (!result)
        {
            return Result<UserDto>.Unauthorized();
        }

        // Get user roles
        string[] roles = (await _userManager.GetRolesAsync(user)).ToArray();

        // Prepare user DTO with JWT token
        UserDto userDto = new()
        {
            FullName = user.FullName!,
            Roles = roles,
            Token = _jwtService.GenerateSecurityToken(user, roles)
        };
        return Result<UserDto>.Ok(userDto);
    }

    /// <summary>
    /// Sends an OTP to the user's email for password reset.
    /// </summary>
    public async Task<Result<Empty>> SendOtpAsync(string email)
    {
        List<ResultError> validationErrors = new();

        // Check if user exists by email
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

        // Generate OTP and store in cache
        string otp = _otpGenerator.GenerateOtp();
        var result = await _otpCache.StoreOtpAsync(otp, email);
        if (!result.IsSuccessful)
        {
            return Result<Empty>.BadRequest(result.ResultErrors);
        }

        // Send OTP via email
        var emailResult = await _messagingService.SendEmail(email, "Password Reset OTP", $"Your OTP is: {otp}. Expires in 5 minutes.");

        if (!emailResult)
        {
            return Result<Empty>.InternalServerError();
        }

        return Result<Empty>.Ok(new Empty());
    }

    /// <summary>
    /// Verifies the OTP for password reset.
    /// </summary>
    public async Task<Result<Empty>> VerifyOtpAsync(string email, string otp)
    {
        List<ResultError> validationErrors = new();

        // Check if user exists by email
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

        // Retrieve OTP from cache
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

        // Check if OTP matches
        if (!otpRetrieved.Equals(otp))
        {
            return Result<Empty>.BadRequest([new ResultError{
                Identifier = "OtpInvalid",
                Message = "Invalid OTP"
            }]);
        }

        return Result<Empty>.Ok(new Empty());
    }

    /// <summary>
    /// Changes the user's password after OTP verification.
    /// </summary>
    public async Task<Result<Empty>> ChangePasswordAsync(ChangePasswordDto changePasswordDto)
    {
        // Validate password complexity
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

        // Generate token and reset password
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, changePasswordDto.NewPassword);

        if (!result.Succeeded)
        {
            return Result<Empty>.BadRequest(result.Errors.Select(x => new ResultError
            {
                Identifier = x.Code,
                Message = x.Description
            }).ToList());
        }

        // Remove the otp from cache
        await _otpCache.RemoveOtpAsync(changePasswordDto.Email);

        return Result<Empty>.Ok(new Empty());
    }

    /// <summary>
    /// Returns a user's profile by their ID.
    /// </summary>
    public async Task<Result<UserProfileDto>> ViewClientProfileAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
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
                dietTypeName = dietType.Name;
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

    /// <summary>
    /// Returns a user's profile by their ID (alternative method).
    /// </summary>
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
                dietTypeName = dietType.Name;
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
    
    /// <summary>
    /// Deletes a user by their ID.
    /// </summary>
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

    /// <summary>
    /// Updates a user's profile information.
    /// </summary>
    public async Task<Result<Empty>> UpdateUserProfileAsync(UserProfileUpdateDto userProfileUpdateDto)
    {
        // Validate height
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

        // Validate phone number
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

        // Validate email
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

        // Find user by ID
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userProfileUpdateDto.UserId);
        if (user == null)
        {
            return Result<Empty>.NotFound();
        }

        // Check if diet type exists
        DietType? dietType = await _dietTypeRepository.GetDietTypeByIdAsync(userProfileUpdateDto.DietTypeId);
        if (dietType == null)
        {
            return Result<Empty>.NotFound();
        }

        // Check for duplicate phone number (if changed)
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

        // Check for duplicate email (if changed)
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

    /// <summary>
    /// Gets a user's ID by their phone number.
    /// </summary>
    public async Task<Result<Guid>> GetUserIdByPhoneNumberAsync(string phoneNumber)
    {
        // Validate phone number
        if (!Regex.IsMatch(phoneNumber, @"^\d+$"))
        {
            return Result<Guid>.BadRequest(new List<ResultError>
            {
                new ResultError{
                    Identifier = "PhoneNumber",
                    Message = "Invalid phone number"
                }
            });
        }

        // Find user by phone number
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
        if (user == null)
        {
            return Result<Guid>.NotFound();
        }

        return Result<Guid>.Ok(user.Id);
    }

    /// <summary>
    /// Gets all clients (without IDs).
    /// </summary>
    public async Task<Result<IEnumerable<UserProfileDto>>> GetAllClientsAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var userProfiles = users.Select(user => new UserProfileDto
        {
            FullName = user.FullName!,
            PhoneNumber = user.PhoneNumber!,
            Email = user.Email!,
            Height = user.Height!,
            DietTypeName = user.DietTypeId.HasValue ? _dietTypeRepository.GetDietTypeByIdAsync(user.DietTypeId.Value).Result?.Name ?? "Unknown" : "Unknown",
            Gender = user.Gender,
            DateOfBirth = user.DateOfBirth
        });

        return Result<IEnumerable<UserProfileDto>>.Ok(userProfiles);
    }

    /// <summary>
    /// Gets all clients (with IDs).
    /// </summary>
    public async Task<Result<IEnumerable<UserProfileDtoWithId>>> GetAllClientsWithIdAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var userProfiles = users.Select(user => new UserProfileDtoWithId
        {
            id = user.Id!,
            FullName = user.FullName!,
            PhoneNumber = user.PhoneNumber!,
            Email = user.Email!,
            Height = user.Height!,
            DietTypeName = user.DietTypeId.HasValue ? _dietTypeRepository.GetDietTypeByIdAsync(user.DietTypeId.Value).Result?.Name ?? "Unknown" : "Unknown",
            Gender = user.Gender,
            DateOfBirth = user.DateOfBirth
        });

        return Result<IEnumerable<UserProfileDtoWithId>>.Ok(userProfiles);
    }
}