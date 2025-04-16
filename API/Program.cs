using API;
using API.Data;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddPersistance(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddSecurityServices(builder.Configuration);
builder.Services.AddCors(x=>{
    x.AddDefaultPolicy(x=>x.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin().WithExposedHeaders("Content-Disposition"));
});


var app = builder.Build();

// Needed for deployment
await using (var serviceScope = app.Services.CreateAsyncScope())
{
    var dataContext = serviceScope.ServiceProvider.GetRequiredService<DataContext>();

    // Apply any pending migrations to the database
    await dataContext.Database.MigrateAsync();

    var userManager = serviceScope.ServiceProvider.GetRequiredService<UserManager<User>>();

    // Initialize the database (seed roles, users, etc.)
    await DbInitializer.Initialize(dataContext, userManager);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles(); // Needed for deployment
app.UseStaticFiles(); // Needed for deployment

app.MapControllers();

app.MapFallbackToController("Index", "Fallback");

app.Run();
