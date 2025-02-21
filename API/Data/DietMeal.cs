namespace API.Data
{
    public class DietMeal
    {
        public Guid Id { get; set; } = new Guid();
        public string MealType { get; set; } = string.Empty;
        public string Meal { get; set; } = string.Empty;

        public Guid DietDayId { get; set; }
        public DietDay? DietDay { get; set; }

    }
}