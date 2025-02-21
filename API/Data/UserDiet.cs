namespace API.Data
{
    public class UserDiet
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid DietId { get; set; }
        public Diet? Diet { get; set; }
    }
}