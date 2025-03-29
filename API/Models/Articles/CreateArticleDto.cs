using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Models.Articles
{
    public class CreateArticleDto
    {
        public required string Title { get; set; }
        public required string Link { get; set; }
        public required string Description { get; set; }
    }
}