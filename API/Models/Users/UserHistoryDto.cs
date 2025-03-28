// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using API.Data;
// using API.Models.Diets;


// namespace API.Models.Users
// {
//     public class UserHistoryDto
//     {
//         public required string FullName { get; set; }
//         public required string PhoneNumber { get; set; }
//         public required string Email { get; set; }
//         public required int Height { get; set; }
//         public required string DietTypeName { get; set; }
//         public required string Gender { get; set; }
//         public required DateOnly DateOfBirth { get; set; }
//     }
//     public class MetricsDto
//     {
//         public required Guid Id { get; set; } 
//         public required float Bodyweight { get; set; }
//         public required float FatMass { get; set; }
//         public required float MuscleMass { get; set; }
//         public required DateTime DateCreated { get; set; } 
//         public required Guid UserId { get; set; }

//     }

//     public class NoteDto
//     {
//         public required Guid Id { get; set; }
//         public required string NoteText { get; set; }
//         public required DateTime DateCreated { get; set; }
//         public required Guid UserId { get; set; }
//     }

//     public class DietDto
//     {
//         public required Guid Id { get; set; }
//         public required string Name { get; set; }
//         public required bool IsTemplate { get; set; }
//         public required DateTime DateCreated { get; set; }
//         public List<UserDietDto> UserDiets { get; set; } = new();

//         public List<DayDto> Days { get; set; } = new();

//     }
// }