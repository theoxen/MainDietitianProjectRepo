namespace API.MobileMessaging.Interfaces
{
    public interface IMessagingService
    {
        public Task<bool> SendEmail(string to, string subject, string body);
    }
}