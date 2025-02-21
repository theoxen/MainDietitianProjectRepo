namespace API.Data
{
    public class Diet
    {
        public Guid Id { get; set; } = new Guid();
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        public bool IsTemplate { get; set; }
        public string Name { get; set; } = string.Empty;

        public List<UserDiet> UserDiets { get; set; } = new List<UserDiet>();
        public List<DietDay> DietDays { get; set; } = new List<DietDay>();
    }
}