namespace API.Models.Users;

public class RegisterClientDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public Guid DietTypeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public  int Height { get; set; } 
    public string Gender { get; set; } = string.Empty;
}
