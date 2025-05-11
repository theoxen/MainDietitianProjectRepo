using API.Data;
using Microsoft.AspNetCore.Identity;

namespace API.Validators
{
    public class FullNameValidator : UserValidator<User>
    {
        // Functions related to fullname validation
        
        public override async Task<IdentityResult> ValidateAsync(UserManager<User> userManager, User user)
        {
            var result = await base.ValidateAsync(userManager, user); // Calling the ValidateAsync of the base class (UserValidator)
            var errors = result.Succeeded ? new List<IdentityError>() : result.Errors.ToList();

            if (!IsValidFullName(user.FullName))
            {
                errors.Add(new IdentityError
                {
                    Code = "InvalidFullName",
                    Description = "Invalid Full Name"
                });
            }

            return errors.Count == 0 ? IdentityResult.Success : IdentityResult.Failed(errors.ToArray());
        }
    

        private bool IsValidFullName(string fullName)
        {
            return !string.IsNullOrWhiteSpace(fullName) && fullName.All(c => char.IsLetter(c) || char.IsWhiteSpace(c)); // Determines whether the fullname is not null or contain only white space and whether all elements of a sequence satisfy a condition.
        }
    }
}