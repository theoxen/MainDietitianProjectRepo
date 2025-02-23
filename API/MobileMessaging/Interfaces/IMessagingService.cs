namespace API.MobileMessaging.Interfaces
{
    public interface IMessagingService
    {
        Task<bool> SendEmail(string to, string subject, string body);
        //dlah xrdm kted qcky
    }
}