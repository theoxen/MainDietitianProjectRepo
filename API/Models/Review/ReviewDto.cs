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
    public int Stars { get; set; }
    public DateTime DateCreated { get; set; }
    public string UserFullName { get; set; }=string.Empty; // Can be anonymous
    public Guid? UserId { get; set; }
    }
}