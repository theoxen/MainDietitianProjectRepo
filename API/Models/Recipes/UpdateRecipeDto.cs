using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Models.Recipes
{
    public class UpdateRecipeDto
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Ingredients { get; set; }
        public required string Directions { get; set; }
        public required float Protein { get; set; }
        public required float Carbs { get; set; }
        public required float Fat { get; set; }
        public required float Calories { get; set; }
    }
}