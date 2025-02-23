using API.MobileMessaging;

MessagingService messagingService = new MessagingService();
await messagingService.SendEmail("alexfytou@gmail.com", "Hello there", "HI! How have you been this lovely sunny day?");