using System.Net;
using System.Net.Mail;
using API.MobileMessaging.Interfaces;

namespace API.MobileMessaging
{
    public class MessagingService : IMessagingService
    {
        public async Task<bool> SendEmail(string to, string subject, string body)
        {
            var fromAddress = new MailAddress("theodosisx874@gmail.com", "TEST");
            var toAddress = new MailAddress(to);
            const string fromPassword = "dlah xrdm kted qcky";

            var smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
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