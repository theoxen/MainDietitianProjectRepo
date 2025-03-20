using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace API.Models.Diets
{

    public class CreateDietDto
    {
        public required string Name { get; set; }
        public bool IsTemplate { get; set; }
        public List<DayDto> Days { get; set; } = new();
        public List<UserDietDto> UserDiets { get; set; } = new();
    }

    public class UserDietDto
    {
      public required Guid UserId { get; set; }
        
    }

    public class DayDto
    {
        public required string DayName { get; set; }
        public List<MealDto> Meals { get; set; } = new();
    }

    public class MealDto
    {
        public required string Meal { get; set; }
        public required String Type { get; set; } // Breakfast, Lunch, Dinner, Snack
    }
}