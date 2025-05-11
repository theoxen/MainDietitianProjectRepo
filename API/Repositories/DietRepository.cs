using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    /// <summary>
    /// Repository class that handles all database operations for Diet entities
    /// Implements the IDietRepository interface to follow the Repository pattern
    /// </summary>
    public class DietRepository : IDietRepository
    {
        // Database context dependency for Entity Framework Core operations
        private readonly DataContext _dataContext;

        /// <summary>
        /// Constructor using dependency injection to receive the database context
        /// </summary>
        public DietRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        /// <summary>
        /// Retrieves a specific diet by its ID including related DietDays and DietMeals (eager loading)
        /// Async method that returns null if diet doesn't exist
        /// </summary>
        public async Task<Diet?> GetDietByIdAsync(Guid id)
        {
            return await _dataContext.Diets
                .Include(d => d.DietDays) // Eager loading of related DietDays
                .ThenInclude(d => d.DietMeals) // Further eager loading of related DietMeals
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        /// <summary>
        /// Retrieves all diets from the database including their related entities
        /// Uses eager loading to avoid multiple database queries later
        /// </summary>
        public async Task<List<Diet>> GetAllDietsAsync()
        {
            return await _dataContext.Diets
                .Include(d => d.DietDays)
                .ThenInclude(d => d.DietMeals)
                .ToListAsync();
        }

        /// <summary>
        /// Searches for a diet by exact name match
        /// Does not include related entities - returns just the diet object
        /// </summary>
        public async Task<Diet?> GetDietByNameAsync(string name)
        {
            return await _dataContext.Diets
                .FirstOrDefaultAsync(d => d.Name == name);
        }

        /// <summary>
        /// Adds a new diet entity to the context (not yet saved to database)
        /// Note: The commented code was for adding user association directly
        /// </summary>
        public void CreateDiet(Diet diet)
        {
        _dataContext.Diets.Add(diet);
        // var userDiet = new UserDiet { UserId = userId, DietId = diet.Id };
        // _dataContext.UserDiets.Add(userDiet);
        }

        /// <summary>
        /// Updates an existing diet entity in the context
        /// Entity must be tracked or have its primary key set for EF to update correctly
        /// </summary>
        public void UpdateDiet(Diet diet)
        {
            _dataContext.Diets.Update(diet);
        }

        /// <summary>
        /// Marks a diet entity for deletion from the database
        /// Actual deletion happens when Commit() is called
        /// </summary>
        public void DeleteDiet(Diet diet)
        {
            _dataContext.Diets.Remove(diet);
        }

        /// <summary>
        /// Creates an association between a user and a diet in the UserDiet junction table
        /// Uses a many-to-many relationship implementation
        /// </summary>
        public void AddUserToDiet(Guid userId, Guid dietId)
        {
        var userDiet = new UserDiet
        {
            UserId = userId,
            DietId = dietId
        };
        _dataContext.UserDiets.Add(userDiet);

        }

        /// <summary>
        /// Saves all pending changes to the database
        /// Returns true if any changes were successfully saved
        /// </summary>
        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }

        /// <summary>
        /// Gets a diet associated with a specific client
        /// Currently doesn't filter by userId - may need implementation correction
        /// </summary>
        public async Task<Diet?> GetDietByClientIdAsync(Guid userId)
        {
            return await _dataContext.Diets
                .Include(d => d.DietDays)
                .ThenInclude(d => d.DietMeals)
                .FirstOrDefaultAsync();
        }

        /// <summary>
        /// Retrieves just the diet ID for a specific user from the junction table
        /// Useful when you only need the ID reference and not the full entity
        /// </summary>
        public async Task<Guid> GetDietIdByClientIdAsync(Guid userId)
        {
            return await _dataContext.UserDiets
                .Where(d => d.UserId == userId)
                .Select(d => d.DietId)
                .FirstOrDefaultAsync();
        }

        /// <summary>
        /// Searches for diets with optional filtering by user ID and creation date
        /// Demonstrates dynamic query building with LINQ
        /// </summary>
        public async Task<List<Diet>> SearchDietsAsync(Guid userId, DateTime? date)
        {
            var query = _dataContext.Diets.AsQueryable(); // Start with the base query

            if (userId != Guid.Empty)
            {
                // Filter by diets associated with specific user
                query = query.Where(m => m.UserDiets.Any(ud => ud.UserId == userId));
            }

            if (date.HasValue && date.Value != DateTime.MinValue)
            {
                // Additional filter by creation date
                query = query.Where(m => m.DateCreated.Date == date.Value.Date);
            }

            return await query.ToListAsync();
        }
    }
}