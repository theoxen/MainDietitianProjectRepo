using System;
using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DataContext _dataContext;

    public UserRepository(DataContext dataContext)
    {
        this._dataContext = dataContext;
    }
    
    public Task<bool> DoesPhoneNumberExistAsync(string phoneNumber)
    {
        return _dataContext.Users.AnyAsync(x => x.PhoneNumber == phoneNumber);
    }
}
