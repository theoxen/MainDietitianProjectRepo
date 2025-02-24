using System;
using API.Common;

namespace API.Repositories.IRepositories;

public interface IUserRepository : IBaseRepository
{
    public Task<bool> DoesPhoneNumberExistAsync(string phoneNumber);
}
