using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using API.Helpers;

namespace API.Data;

public class DbInitializer
{
    public static async Task Initialize(DataContext dataContext, UserManager<User> userManager)
    {
        bool areRolesInitialized = await InitializeRoles(dataContext);
        if(!areRolesInitialized) throw new Exception("Internal Server Error: Roles initialization failed.");

        bool areUsersInitialized = await InitializeUsers(userManager);
        if(!areUsersInitialized) throw new Exception("Internal Server Error: Users initialization failed.");

        bool areDietTypesInitialized = await InitializeDietTypes(dataContext);
        if(!areDietTypesInitialized) throw new Exception("Internal Server Error: Diet Types initialization failed.");
    } 

    private static async Task<bool> InitializeRoles(DataContext dataContext) // (RoleManager also exists)
    {
        if(await dataContext.Roles.AnyAsync()) return true; // AnyAsync() returns true/false based on the condition (in this case where no condition exists, if any roles exist it returns true)

        Role admin = new Role("admin");
        Role client = new Role("client");

        dataContext.Roles.AddRange([admin, client]);
        return await dataContext.SaveChangesAsync() > 0;
    }

    private static async Task<bool> InitializeUsers(UserManager<User> userManager)
    {

        if(await userManager.Users.AnyAsync()) return true; // If users already exist in database we assume that the admin has already been created
        
        User admin = new User{
            FullName = "admin",
            PhoneNumber = "123456789",
            Email = "adminemail@gmail.com",
            UserName = UserHelperFunctions.GenerateUniqueUserName("admin")
        };

        var result = await userManager.CreateAsync(admin, "Pa$w0r!d1");
        
        if(!result.Succeeded) return false;

        var roleResult = await userManager.AddToRoleAsync(admin, "admin");

        return roleResult.Succeeded;
    }

    private static async Task<bool> InitializeDietTypes(DataContext dataContext)
    {
        if(await dataContext.DietTypes.AnyAsync()) return true;

        DietType[] dietTypes = [
            new DietType("Special Diet"),
            new DietType("Muscle Gain"),
            new DietType("Fat Loss"),
            new DietType("Weight Gain"),
            new DietType("Weight Loss")
        ];

        dataContext.DietTypes.AddRange(dietTypes);
        return await dataContext.SaveChangesAsync() > 0;
    }
}
