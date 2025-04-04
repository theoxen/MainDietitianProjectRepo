namespace API.Models.Diets
{
    public class DietDto
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required bool IsTemplate { get; set; }
        public required DateTime DateCreated { get; set; }
        public List<UserDietDto> UserDiets { get; set; } = new();

        public List<DayDto> Days { get; set; } = new();

    }
}


