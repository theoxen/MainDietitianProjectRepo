using System;
using API.Common;

namespace API.Repositories.IRepositories;

public interface IUserRepository
{
    public Task<bool> DoesPhoneNumberExistAsync(string phoneNumber);
}
