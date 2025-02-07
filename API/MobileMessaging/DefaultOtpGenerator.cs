using API.MobileMessaging.Interfaces;

namespace API.MobileMessaging
{
    public class DefaultOtpGenerator : IOtpGenerator
    {
        private readonly Random random;
        public DefaultOtpGenerator()
        {
            random = new Random();
        }

        public string GenerateOtp()
        {
            return random.Next(100000, 1000000).ToString(); // Upperbound is exclusive
        }
    }
}