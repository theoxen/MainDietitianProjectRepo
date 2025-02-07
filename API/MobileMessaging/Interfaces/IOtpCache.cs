using API.Common;

namespace API.MobileMessaging.Interfaces
{
    public interface IOtpCache
    {
        public Task<Result<Empty>> StoreOtpAsync(string otp, string phoneNumber);
        public Task<string?> RetrieveOtpAsync(string phoneNumber);
        public Task<Result<Empty>> RemoveOtpAsync(string phoneNumber);
    }
}