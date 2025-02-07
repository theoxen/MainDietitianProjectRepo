using System;
using API.Common;
using API.Data;
using API.Models.DietTypes;

namespace API.Services.IServices;

public interface IDietTypesService
{
    public Task<Result<List<DietTypeDto>>> GetAllDietTypesAsync();
}
