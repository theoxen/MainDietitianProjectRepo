using System;

namespace API.Models.Diets
{
    public class CreateDietDto
    {
        public required string Name { get; set; }
        public required bool IsTemplate { get; set; }
    }
}