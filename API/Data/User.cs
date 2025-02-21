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
    
    public List<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public List<Metrics> Metrics { get; set; } = new List<Metrics>(); // NEW
    public List<Appointment> Appointments { get; set; } = new List<Appointment>(); // NEW
    public List<UserDiet> UserDiets { get; set; } = new List<UserDiet>(); // NEW

    public User() // Every time a new user is created, a guid is automatically created
    {
        Id = Guid.NewGuid();
    }
}
