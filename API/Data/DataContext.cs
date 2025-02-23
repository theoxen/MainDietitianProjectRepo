using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext : IdentityDbContext<User, Role, Guid, IdentityUserClaim<Guid>, UserRole, IdentityUserLogin<Guid>, IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>
{
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {

    }

    public DbSet<DietType> DietTypes { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Advice> Advice { get; set; }
    public DbSet<Article> Articles { get; set; }    

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Manually adding the relations of the tables (User, Role, UserRole)
        builder.Entity<UserRole>(x =>
        {
            x.HasKey(x => new
            {
                UserId = x.UserId,
                RoleId = x.RoleId
            });
            x.HasOne(x => x.User).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserId);
            x.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
        });

        // Manually adding the user-diet relation
        builder.Entity<UserDiet>(x =>
        {
            x.HasKey(x => new
            {
                UserId = x.UserId,
                DietId = x.DietId
            });
            x.HasOne(x => x.User).WithMany(x => x.UserDiets).HasForeignKey(x => x.UserId);
            x.HasOne(x => x.Diet).WithMany(x => x.UserDiets).HasForeignKey(x => x.DietId);
        });

        builder.Entity<DietDay>(x =>
        {
            x.HasOne(x => x.Diet).WithMany(x => x.DietDays).HasForeignKey(x => x.DietId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DietMeal>(x =>
        {
            x.HasOne(x => x.DietDay).WithMany(x => x.DietMeals).HasForeignKey(x => x.DietDayId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Note>(x =>
        {
            x.HasOne(x => x.User)
             .WithOne() // No navigation property on User side
             .HasForeignKey<Note>(x => x.UserId) // <Note> denotes the entity type that contains the foreign key
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Appointment>(x =>
        {
            x.HasOne(x => x.User).WithMany(x => x.Appointments).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Metrics>(x =>
        {
            x.HasOne(x => x.User).WithMany(x => x.Metrics).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserDiet>(x =>
        {
            x.HasOne(x => x.User).WithMany(x => x.UserDiets).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Setting null on delete for Reviews
        builder.Entity<Review>(x =>
        {
            x.HasOne(x => x.User).WithOne().HasForeignKey<Review>(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
        });


    }
}
