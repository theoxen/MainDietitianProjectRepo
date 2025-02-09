namespace API.Models.ForgetPassword
{
    public class ChangePasswordDto
    {
        public required string Email { get; set; }
        public required string Otp { get; set; }
        public required string NewPassword { get; set; }
    }
}