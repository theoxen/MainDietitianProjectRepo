using System;

namespace API.Models.DietTypes;

public class DietTypeDto
{
    public Guid Id { get; set; }

    public required string Name { get; set; }
}
