namespace API.Models.Diets
{
    public class UpdateDietDto
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required bool IsTemplate { get; set; }
    }
}