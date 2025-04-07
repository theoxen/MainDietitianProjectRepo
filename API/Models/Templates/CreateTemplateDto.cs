namespace API.Models.Templates
{
    public class CreateTemplateDto
    {
        public required string Name { get; set; }
        public List<CreateDietDayDto> Days { get; set; } = new List<CreateDietDayDto>();
    }

    public class CreateDietDayDto
    {
        public required string DayName { get; set; }
        public List<CreateDietMealDto> Meals { get; set; } = new List<CreateDietMealDto>();
    }

    public class CreateDietMealDto
    {
        public required string MealType { get; set; }
        public required string Meal { get; set; }
    }
}