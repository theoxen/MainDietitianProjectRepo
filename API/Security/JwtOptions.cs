namespace API.Security;

public class JwtOptions
{
    public required string Key { get; set; }
    public required int DurationInMinutes { get; set; }
}
