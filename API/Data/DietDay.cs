namespace API.Data
{
    public class DietDay
    {
        public Guid Id { get; set; } = new Guid();
        public string DayName { get; set; } = string.Empty;
        public Guid DietId { get; set; }

        public Diet? Diet { get; set; }
        public List<DietMeal> DietMeals { get; set; } = new List<DietMeal>();
    }
}