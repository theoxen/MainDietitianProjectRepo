using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace API.Models.Diets
{



    public class CreateDietDto
    {
        public required string Name { get; set; }
        public bool IsTemplate { get; set; }
        public List<DayDto> Days { get; set; } = new();
    }

    public class DayDto
    {
        public required string DayName { get; set; }
        public List<MealDto> Meals { get; set; } = new();
    }

    public class MealDto
    {
        public required string Meal { get; set; }
        public required String Type { get; set; } // 1: Breakfast, 2: Snack1, 3: Lunch, 4: Snack2, 5: Dinner
    }
}