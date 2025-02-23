using System.Net;
using System.Net.Mail;
using API.MobileMessaging.Interfaces;
using Microsoft.Extensions.Options;

namespace API.MobileMessaging
{
    public class MessagingService : IMessagingService
    {
        private readonly EmailSettings _emailSettings;

        public MessagingService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }
        
        public async Task<bool> SendEmail(string to, string subject, string body)
        {
            var fromAddress = new MailAddress(_emailSettings.FromAddress, _emailSettings.FromName);
            var toAddress = new MailAddress(to);
            string fromPassword = _emailSettings.FromPassword;

            var smtp = new SmtpClient
            {
                Host = _emailSettings.Host,
                Port = _emailSettings.Port,
                EnableSsl = _emailSettings.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = _emailSettings.UseDefaultCredentials,
                Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
            };

            using (var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body
            })
            {
                try
                {
                   await smtp.SendMailAsync(message);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return false;
                }
                
                return true;
            }
        }
    }
}