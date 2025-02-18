
namespace API.Models.ForgetPassword
{
    public class OtpVerificationDto
    {
        public required string Email { get; set; }
        public required string Otp { get; set; }
    }
}