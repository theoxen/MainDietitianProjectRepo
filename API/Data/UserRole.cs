using System;
using Microsoft.AspNetCore.Identity;

namespace API.Data;

public class UserRole : IdentityUserRole<Guid>
{
    // UserId and Roleid exist in the identityuserrole
    public User? User { get; set; }
    public Role? Role { get; set; }

    // Ctor is not needed because we get the keys from the role and user classes
}
