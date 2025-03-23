using API.Data;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using API.Services.IServices;


namespace API.Services
{
    public class DataBackupAndRestoreService : IDataBackupAndRestoreService
    {
        private readonly DataContext _context;

        public DataBackupAndRestoreService(DataContext context)
        {
            _context = context;
        }

        public async Task<(string fileName, string jsonData)> BackupDataAsync()
        {
            try
            {
                // Create a container for storing our data
                var backupData = new Dictionary<string, object>
                {
                    // Gather data from all tables except EF migrations
                    { "Advice", await _context.Advice.ToListAsync() },
                    { "Appointments", await _context.Appointments.ToListAsync() },
                    { "Articles", await _context.Articles.ToListAsync() },
                    { "Diets", await _context.Diets.ToListAsync() },
                    { "DietDays", await _context.DietDays.ToListAsync() },
                    { "DietMeals", await _context.DietMeals.ToListAsync() },
                    { "DietTypes", await _context.DietTypes.ToListAsync() },
                    { "Metrics", await _context.Metrics.ToListAsync() },
                    { "Notes", await _context.Notes.ToListAsync() },
                    { "Recipes", await _context.Recipes.ToListAsync() },
                    { "Reviews", await _context.Reviews.ToListAsync() },
                    { "UserDiets", await _context.UserDiets.ToListAsync() },

                    // Identity tables
                    { "AspNetRoles", await _context.Roles.ToListAsync() },
                    { "AspNetUsers", await _context.Users.ToListAsync() },
                    { "AspNetUserRoles", await _context.UserRoles.ToListAsync() },
                    { "AspNetRoleClaims", await _context.Set<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToListAsync() },
                    { "AspNetUserClaims", await _context.Set<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToListAsync() },
                    { "AspNetUserLogins", await _context.Set<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToListAsync() },
                    { "AspNetUserTokens", await _context.Set<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToListAsync() }
                };

                // Convert to JSON using Newtonsoft.Json instead of System.Text.Json
                var settings = new JsonSerializerSettings
                {
                    Formatting = Formatting.Indented,
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                    PreserveReferencesHandling = PreserveReferencesHandling.Objects
                };

                string jsonData = JsonConvert.SerializeObject(backupData, settings);

                // Generate filename with timestamp
                string fileName = $"db_backup_{DateTime.Now:yyyyMMdd_HHmmss}.json";

                // _logger.LogInformation($"Database backup created with filename: {fileName}");

                // Return both the filename and JSON data
                return (fileName, jsonData);
            }
            catch (Exception)
            {
                // _logger.LogError(ex, "Error during database backup");
                throw;
            }
        }
        public async Task RestoreDataAsync(string jsonData)
        {
            try
            {
                // Use Newtonsoft.Json instead of System.Text.Json
                var settings = new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                    PreserveReferencesHandling = PreserveReferencesHandling.Objects,
                    TypeNameHandling = TypeNameHandling.Auto
                };

                // Deserialize the JSON data
                var backupData = JsonConvert.DeserializeObject<Dictionary<string, JArray>>(jsonData, settings);

                if (backupData == null)
                {
                    throw new ArgumentException("Invalid backup data format");
                }

                // Begin a transaction
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // For Azure SQL Database, we can't use sp_MSforeachtable
                    // Instead, we'll set database to a more permissive isolation level
                    await _context.Database.ExecuteSqlRawAsync("SET XACT_ABORT ON");

                    // Delete existing data
                    await DeleteExistingDataAsync();

                    // Restore data
                    foreach (var kvp in backupData)
                    {
                        string tableName = kvp.Key;
                        JArray data = kvp.Value;

                        switch (tableName)
                        {
                            // Independent tables first
                            case "DietTypes":
                                foreach (var item in data)
                                {
                                    var dietType = item.ToObject<DietType>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (dietType != null)
                                    {
                                        await _context.DietTypes.AddAsync(dietType);
                                    }
                                }
                                break;

                            case "Advice":
                                foreach (var item in data)
                                {
                                    var advice = item.ToObject<Advice>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (advice != null)
                                    {
                                        await _context.Advice.AddAsync(advice);
                                    }
                                }
                                break;

                            case "Articles":
                                foreach (var item in data)
                                {
                                    var article = item.ToObject<Article>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (article != null)
                                    {
                                        await _context.Articles.AddAsync(article);
                                    }
                                }
                                break;

                            case "Recipes":
                                foreach (var item in data)
                                {
                                    var recipe = item.ToObject<Recipe>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (recipe != null)
                                    {
                                        await _context.Recipes.AddAsync(recipe);
                                    }
                                }
                                break;

                            case "AspNetRoles":
                                foreach (var item in data)
                                {
                                    var role = item.ToObject<Role>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (role != null)
                                    {
                                        await _context.Roles.AddAsync(role);
                                    }
                                }
                                break;

                            // Second level - tables with dependencies on independent tables
                            case "AspNetUsers":
                                foreach (var item in data)
                                {
                                    var user = item.ToObject<User>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (user != null)
                                    {
                                        await _context.Users.AddAsync(user);
                                    }
                                }
                                break;

                            case "Diets":
                                foreach (var item in data)
                                {
                                    var diet = item.ToObject<Diet>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (diet != null)
                                    {
                                        await _context.Diets.AddAsync(diet);
                                    }
                                }
                                break;

                            // Third level - tables dependent on second level
                            case "DietDays":
                                foreach (var item in data)
                                {
                                    var dietDay = item.ToObject<DietDay>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (dietDay != null)
                                    {
                                        await _context.DietDays.AddAsync(dietDay);
                                    }
                                }
                                break;

                            case "Metrics":
                                foreach (var item in data)
                                {
                                    var metrics = item.ToObject<Metrics>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (metrics != null)
                                    {
                                        await _context.Metrics.AddAsync(metrics);
                                    }
                                }
                                break;

                            case "Notes":
                                foreach (var item in data)
                                {
                                    var note = item.ToObject<Note>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (note != null)
                                    {
                                        await _context.Notes.AddAsync(note);
                                    }
                                }
                                break;

                            case "Reviews":
                                foreach (var item in data)
                                {
                                    var review = item.ToObject<Review>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (review != null)
                                    {
                                        await _context.Reviews.AddAsync(review);
                                    }
                                }
                                break;

                            case "AspNetRoleClaims":
                                foreach (var item in data)
                                {
                                    var roleClaim = item.ToObject<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (roleClaim != null)
                                    {
                                        await _context.Set<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().AddAsync(roleClaim);
                                    }
                                }
                                break;

                            case "AspNetUserClaims":
                                foreach (var item in data)
                                {
                                    var userClaim = item.ToObject<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (userClaim != null)
                                    {
                                        await _context.Set<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().AddAsync(userClaim);
                                    }
                                }
                                break;

                            case "AspNetUserLogins":
                                foreach (var item in data)
                                {
                                    var userLogin = item.ToObject<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (userLogin != null)
                                    {
                                        await _context.Set<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().AddAsync(userLogin);
                                    }
                                }
                                break;

                            case "AspNetUserTokens":
                                foreach (var item in data)
                                {
                                    var userToken = item.ToObject<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (userToken != null)
                                    {
                                        await _context.Set<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().AddAsync(userToken);
                                    }
                                }
                                break;

                            // Junction tables - most dependent
                            case "UserDiets":
                                foreach (var item in data)
                                {
                                    var userDiet = item.ToObject<UserDiet>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (userDiet != null)
                                    {
                                        await _context.UserDiets.AddAsync(userDiet);
                                    }
                                }
                                break;

                            case "AspNetUserRoles":
                                foreach (var item in data)
                                {
                                    var userRole = item.ToObject<UserRole>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (userRole != null)
                                    {
                                        await _context.UserRoles.AddAsync(userRole);
                                    }
                                }
                                break;

                            // Most dependent tables last
                            case "DietMeals":
                                foreach (var item in data)
                                {
                                    var dietMeal = item.ToObject<DietMeal>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (dietMeal != null)
                                    {
                                        await _context.DietMeals.AddAsync(dietMeal);
                                    }
                                }
                                break;

                            case "Appointments":
                                foreach (var item in data)
                                {
                                    var appointment = item.ToObject<Appointment>(Newtonsoft.Json.JsonSerializer.Create(settings));
                                    if (appointment != null)
                                    {
                                        await _context.Appointments.AddAsync(appointment);
                                    }
                                }
                                break;
                        }
                    }

                    await _context.SaveChangesAsync();

                    // Reset the transaction abort setting
                    await _context.Database.ExecuteSqlRawAsync("SET XACT_ABORT OFF");

                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception)
            {
                // _logger.LogError(ex, "Error during database restore");
                throw;
            }
        }

        private async Task DeleteExistingDataAsync()
        {
            // Delete data in reverse order of dependencies - no need to disable constraints
            // as we're deleting in the correct order

            // First delete dependent tables
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [AspNetUserTokens]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [AspNetUserLogins]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [AspNetUserClaims]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [AspNetRoleClaims]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [AspNetUserRoles]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [UserDiets]");

            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [DietMeals]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [DietDays]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Metrics]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Appointments]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Notes]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Reviews]");

            // Then delete parent tables
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Diets]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [AspNetUsers]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [AspNetRoles]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [DietTypes]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Advice]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Articles]");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM [Recipes]");
        }

    }
}

