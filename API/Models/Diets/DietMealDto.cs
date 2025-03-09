using API.Data;

namespace API.Models.Diets
{
    public class DietMealDto
    {      
        public required Guid MealID { get; set; }
        public required string MealType { get; set; }
        public required string Meal { get; set; }
        public required Guid DietID { get; set; }
        public required DietDay DietDay { get; set; }
    }
}