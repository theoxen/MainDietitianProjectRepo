using System.Threading.Tasks;
using API.Data;
using API.Models.Diets;

namespace API.Models.Reports
{
    public class ReportsViewDto
    {
    public required string FullName { get; set; }
    public required string Gender { get; set; }
    public required int Height { get; set; }
    public required Guid? DietTypeId { get; set; }
    public required DietType? DietType { get; set; }
    public required DateOnly DateOfBirth { get; set; }
    public required DateTime DateCreated { get; set; }
    
    public required List<UserRole> UserRoles { get; set; }
    public required List<MetricsDto> Metrics { get; set; }
    public required List<AppointmentDto> Appointments { get; set; }
    }
}