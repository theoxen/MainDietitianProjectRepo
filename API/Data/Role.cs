using Microsoft.AspNetCore.Identity;

namespace API.Data;

public class Role : IdentityRole<Guid>
{
    public List<UserRole> UserRoles { get; set; } = new();

    public Role(string name) // Every time a Role user is created, a guid is automatically created
    {
        // These properties exist in IdentityRole
        Id = Guid.NewGuid();
        Name = name;
        NormalizedName = name.ToUpper();
        ConcurrencyStamp = DateTime.UtcNow.ToString();
    }
}
