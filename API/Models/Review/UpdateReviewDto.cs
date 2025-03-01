using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.ComponentModel.DataAnnotations;

namespace API.Models.Review
{
    public class UpdateReviewDto
    {
    public Guid Id { get; set; }
    public string? ReviewText { get; set; }

    [Range(1, 5)]
    public int Stars { get; set; }
    }
}