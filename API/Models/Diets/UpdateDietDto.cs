namespace API.Models.Diets
{
    public class UpdateDietDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public bool IsTemplate { get; set; }
        public List<UserDietDto> UserDiets { get; set; } = new();
        public List<DayDto> Days { get; set; } = new();
    }
    
    
}