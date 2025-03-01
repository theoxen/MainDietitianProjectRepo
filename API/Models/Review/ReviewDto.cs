using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.ComponentModel.DataAnnotations;

namespace API.Models.Review
{
    public class ReviewDto
    {
    public Guid Id { get; set; }
    public string? ReviewText { get; set; }

    [Range(1, 5)]
    public int Stars { get; set; }
    public DateTime DateCreated { get; set; }
    public string? UserFullName { get; set; } // Can be anonymous
    public Guid? UserId { get; set; }
    }
}