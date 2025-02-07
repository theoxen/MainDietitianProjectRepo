using API.Data;

namespace API.Models.Users;

public class UserDto
{
    public required string FullName { get; set; }
    public required string[] Roles { get; set; }
    public required string Token { get; set; }
}
