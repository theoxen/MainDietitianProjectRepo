using System.Text;
using API.Data;
using API.MobileMessaging;
using API.MobileMessaging.Interfaces;
using API.Repositories;
using API.Repositories.IRepositories;
using API.Security;
using API.Services;
using API.Services.IServices;
using API.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API;

// All the extensions of the program.cs class
public static class DependencyInjection
{
    // Persistance means something permanent
    public static IServiceCollection AddPersistance(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<DataContext>(x => x.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddIdentityCore<User>(opt => {
            opt.Password.RequireNonAlphanumeric = false;
        }).AddRoles<Role>()
        .AddEntityFrameworkStores<DataContext>()
        .AddDefaultTokenProviders() // DefaultTokenProviders are for password reset
        .AddUserValidator<FullNameValidator>(); // Register the custom user validator. We can chain multiple validators to the User object with AddUserValidator

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IDietTypeRepository, DietTypeRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDietTypesService,DietTypesService>();

        services.AddSingleton<IOtpGenerator, DefaultOtpGenerator>();
        services.AddScoped<IOtpCache, DefaultOtpCache>();

        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();

        services.AddScoped<IArticleService, ArticleService>();
        services.AddScoped<IArticleRepository, ArticleRepository>();

        services.AddScoped<IDietService, DietService>();
        services.AddScoped<IDietRepository, DietRepository>();

        services.AddScoped<IMetricsService, MetricsService>();
        services.AddScoped<IMetricsRepository, MetricsRepository>();

        services.AddScoped<INoteService, NoteService>();
        services.AddScoped<INoteRepository, NoteRepository>();
        
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<IRecipeRepository, RecipeRepository>();

        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IReportRepository, ReportRepository>();

        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IReviewRepository, ReviewRepository>();

        services.AddDistributedMemoryCache();

        return services;
    }

    public static IServiceCollection AddSecurityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("JwtOptions"));
        services.AddSingleton<JwtService>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options => {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtOptions:Key"]!)),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

        return services;
    }
}
