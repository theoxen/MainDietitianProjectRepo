using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Data;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace API.Security;

public class JwtService
{
    private readonly SymmetricSecurityKey _key;
    private readonly int _durationInMinutes;
    public JwtService(IOptions<JwtOptions> options)
    {
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.Key));
        _durationInMinutes = options.Value.DurationInMinutes;
    }

    public string GenerateSecurityToken(User user, string[] roleNames)
    {
        var claims = new List<Claim> // Creating the claims of the token
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName!)
        };

        // Add role claims
        foreach (string role in roleNames)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var credentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor // Creating the fields to add to the token
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_durationInMinutes),
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
