using API.Common;
using API.MobileMessaging.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace API.MobileMessaging
{
    public class DefaultOtpCache : IOtpCache
    {
        public readonly IDistributedCache _cache;
        public DefaultOtpCache(IDistributedCache cache)
        {
            _cache = cache;
        }
        public async Task<Result<Empty>> StoreOtpAsync(string otp, string email)
        {
            var cacheKey = $"OTP_{email}";
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) // OTP expires in 5 minutes
            };

            await _cache.SetStringAsync(cacheKey, otp, cacheOptions);
            return Result<Empty>.Ok(new Empty());
           
        }

        public async Task<string?> RetrieveOtpAsync(string email)
        {
            var cacheKey = $"OTP_{email}";
            var otp = await _cache.GetStringAsync(cacheKey);

            if(otp == null)
            {
                return null;
            }

            return otp;
        }

        public async Task<Result<Empty>> RemoveOtpAsync(string email)
        {
            var cacheKey = $"OTP_{email}";
            await _cache.RemoveAsync(cacheKey);
            return Result<Empty>.Ok(new Empty());
        }
    }
}