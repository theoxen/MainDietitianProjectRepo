namespace API.Models.Templates
{
    public class TemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsTemplate { get; set; }
        public DateTime DateCreated { get; set; }
        public List<TemplateDayDto> Days { get; set; } = new List<TemplateDayDto>();
    }

    public class TemplateDayDto
    {
        public Guid Id { get; set; }
        public string DayName { get; set; } = string.Empty;
        public Guid DietId { get; set; }
        public List<TemplateMealDto> Meals { get; set; } = new List<TemplateMealDto>();
    }

    public class TemplateMealDto
    {
        public Guid Id { get; set; }
        public string MealType { get; set; } = string.Empty;
        public string Meal { get; set; } = string.Empty;
        public Guid DietDayId { get; set; }
    }
}