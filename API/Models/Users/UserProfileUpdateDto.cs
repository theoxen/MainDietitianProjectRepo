using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using System.ComponentModel.DataAnnotations;
using API.Models.Users;


namespace API.Models.Users
{
    public class UserProfileUpdateDto
    {
        public required string FullName { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required int Height { get; set; }
        public required Guid DietTypeId { get; set; }
        public required Guid UserId { get; set; }
    }
}