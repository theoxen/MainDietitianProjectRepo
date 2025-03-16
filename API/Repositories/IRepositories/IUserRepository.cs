using System;
using API.Common;
using API.Data;

namespace API.Repositories.IRepositories;

public interface IUserRepository : IBaseRepository
{
    Task<IEnumerable<User>> GetAllClientsAsync();
    public Task<bool> DoesPhoneNumberExistAsync(string phoneNumber);
}


