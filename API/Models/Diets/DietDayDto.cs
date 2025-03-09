namespace API.Models.Diets
{
    public class DietDayDto
    {
       public required Guid Id { get; set; }
       public required string DayName { get; set; }
       public required Guid DietID { get; set; }
    }
}