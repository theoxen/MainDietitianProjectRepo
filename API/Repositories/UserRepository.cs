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
        _dataContext = dataContext;
    }

    public Task<bool> DoesPhoneNumberExistAsync(string phoneNumber)
    {
        return _dataContext.Users.AnyAsync(x => x.PhoneNumber == phoneNumber);
    }

    public async Task<bool> Commit()
    {
        return await _dataContext.SaveChangesAsync() > 0;
    }

     public async Task<IEnumerable<User>> GetAllClientsAsync()
    {
        return await _dataContext.Users.ToListAsync();
    }

}
