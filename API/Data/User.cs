using Microsoft.AspNetCore.Identity;

namespace API.Data;

public class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public int Height { get; set; }
    public Guid? DietTypeId { get; set; }
    public DietType? DietType { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    public List<UserRole> UserRoles { get; set; } = new();

    public User() // Every time a new user is created, a guid is automatically created
    {
        Id = Guid.NewGuid();
    }
}
