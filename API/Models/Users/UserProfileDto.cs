using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;


namespace API.Models.Users
{
    public class UserProfileDto
    {
        public required string FullName { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required int Height { get; set; }
        public required string DietTypeName { get; set; }
        public required string Gender { get; set; }
        public required DateOnly DateOfBirth { get; set; }
    }
}