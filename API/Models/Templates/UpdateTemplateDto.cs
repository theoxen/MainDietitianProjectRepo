namespace API.Models.Templates
{
    public class UpdateTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<UpdateTemplateDayDto> Days { get; set; } = new List<UpdateTemplateDayDto>();
    }

    public class UpdateTemplateDayDto
    {
        public Guid Id { get; set; }
        public string DayName { get; set; } = string.Empty;
        public List<UpdateTemplateMealDto> Meals { get; set; } = new List<UpdateTemplateMealDto>();
    }

    public class UpdateTemplateMealDto
    {
        public Guid Id { get; set; }
        public string MealType { get; set; } = string.Empty;
        public string Meal { get; set; } = string.Empty;
    }
}