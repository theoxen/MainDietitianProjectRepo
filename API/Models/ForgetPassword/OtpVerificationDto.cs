namespace API.Models.ForgetPassword
{
    public class OtpVerificationDto
    {
        public required string PhoneNumber { get; set; }
        public required string Otp { get; set; }
    }
}