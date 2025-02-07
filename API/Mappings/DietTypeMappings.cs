using System;
using API.Data;
using API.Models.DietTypes;

namespace API.Mappings;

public static class DietTypeMappings
{
    public static DietTypeDto MapToDto(this DietType dietType)
    {
        return new DietTypeDto {
            Id=dietType.Id,
            Name=dietType.Name
        };
    }


    public static List<DietTypeDto> MapToDto(this List<DietType> dietTypes)
    {
        return dietTypes.Select(x=>x.MapToDto()).ToList();
    }
}
