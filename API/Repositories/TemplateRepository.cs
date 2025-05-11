using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories
{
    /// <summary>
    /// Repository class that handles CRUD operations for diet templates in the database.
    /// Implements the ITemplateRepository interface defining the contract for template operations.
    /// </summary>
    public class TemplateRepository : ITemplateRepository
    {
        // Private field to store the database context injected via constructor
        private readonly DataContext _dataContext;
        
        /// <summary>
        /// Constructor that injects the database context using dependency injection
        /// </summary>
        /// <param name="dataContext">The EF Core database context for accessing the database</param>
        public TemplateRepository(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        /// <summary>
        /// Creates a new diet template by adding it to the DbSet
        /// Note: This doesn't save to database until Commit() is called
        /// </summary>
        /// <param name="diet">The diet object to be added as a template</param>
        public void CreateTemplate(Diet diet)
        {
            _dataContext.Diets.Add(diet);
        }

        /// <summary>
        /// Retrieves a specific diet template with its related entities by ID asynchronously
        /// Includes the nested relationships of DietDays and DietMeals for a complete template
        /// </summary>
        /// <param name="id">The unique identifier of the diet template</param>
        /// <returns>The requested Diet object or null if not found</returns>
        public Task<Diet?> GetTemplateByIdAsync(Guid id)
        {
            return _dataContext.Diets
                .Include(d => d.DietDays) // Eager loading of diet days
                    .ThenInclude(dd => dd.DietMeals) // Eager loading of meals within each day
                .FirstOrDefaultAsync(d => d.Id == id); // Returns null if not found
        }

        /// <summary>
        /// Gets a brief list of all diet templates without related entities
        /// Filters to only include records where IsTemplate flag is true
        /// </summary>
        /// <returns>List of template Diet objects without their related entities</returns>
        public Task<List<Diet>> GetAllTemplatesBriefAsync()
        {
            return _dataContext.Diets.Where(d => d.IsTemplate).ToListAsync();
        }

        /// <summary>
        /// Marks a diet template for deletion
        /// Note: This doesn't permanently delete until Commit() is called
        /// </summary>
        /// <param name="diet">The diet template to be deleted</param>
        public void DeleteTemplate(Diet diet)
        {
            _dataContext.Diets.Remove(diet);
        }

        /// <summary>
        /// Saves all pending changes to the database
        /// Returns true if any changes were actually saved
        /// </summary>
        /// <returns>True if at least one record was modified, false otherwise</returns>
        public async Task<bool> Commit()
        {
            return await _dataContext.SaveChangesAsync() > 0;
        }
    }
}